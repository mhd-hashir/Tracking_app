import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch Employees
        const employees = await prisma.user.findMany({
            where: {
                ownerId: user.id,
                // Make sure we get all employees capable of being tracked
                role: 'EMPLOYEE'
            },
            select: {
                id: true,
                name: true,
                email: true,
                lastLatitude: true,
                lastLongitude: true,
                lastLocationUpdate: true,
                isOnDuty: true
            }
        });

        // 2. Fetch Shops
        const shops = await prisma.shop.findMany({
            where: { ownerId: user.id }
        });

        // 3. Fetch History (Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get employee IDs first to optimize or simplify
        const employeeIds = employees.map(e => e.id);

        const historyData = await prisma.locationHistory.findMany({
            where: {
                timestamp: { gte: today },
                employeeId: { in: employeeIds }
            },
            orderBy: { timestamp: 'asc' }
        });

        // Group paths by employee
        const historyPaths: { [key: string]: { latitude: number, longitude: number }[] } = {};
        historyData.forEach(h => {
            if (!historyPaths[h.employeeId]) historyPaths[h.employeeId] = [];
            historyPaths[h.employeeId].push({ latitude: h.latitude, longitude: h.longitude });
        });

        // 4. Fetch Collections (Today)
        const collections = await prisma.collection.findMany({
            where: {
                shop: { ownerId: user.id },
                collectedAt: { gte: today }
            },
            include: {
                shop: { select: { name: true } },
                employee: { select: { name: true } }
            },
            orderBy: { collectedAt: 'desc' }
        });

        return NextResponse.json({
            employees: employees,
            shops: shops,
            historyPaths: historyPaths,
            collections: collections
        });

    } catch (error) {
        console.error('Live map error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
