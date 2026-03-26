
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get routes assigned to this employee
        // Optionally filter by day of week? For now, get all assigned.
        // Get routes assigned to this employee
        const routes = await prisma.route.findMany({
            where: {
                assignedToId: user.id,
            },
            include: {
                stops: {
                    orderBy: { order: 'asc' },
                    include: {
                        shop: true
                    }
                }
            }
        });

        // Fetch Today's Collections for this employee to determine status
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const collections = await prisma.collection.findMany({
            where: {
                employeeId: user.id,
                collectedAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        // Map Collection Status to Shop/Stop
        // Create a map of shopId -> status
        const statusMap = new Map();
        collections.forEach(c => {
            statusMap.set(c.shopId, {
                collected: c.amount > 0,
                remark: !!c.remarks,
                edited: c.isEdited || false // Requires schema update
            });
        });

        // Enhance routes with status
        const enhancedRoutes = routes.map(route => ({
            ...route,
            stops: route.stops.map(stop => ({
                ...stop,
                shop: {
                    ...stop.shop,
                    todayStatus: statusMap.get(stop.shop.id) || { collected: false, remark: false, edited: false }
                }
            }))
        }));

        return NextResponse.json({ routes: enhancedRoutes });
    } catch (error) {
        console.error('Employee routes error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
