
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

        return NextResponse.json({ routes });
    } catch (error) {
        console.error('Employee routes error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
