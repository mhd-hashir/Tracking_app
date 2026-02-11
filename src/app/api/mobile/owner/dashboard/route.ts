
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [activeEmployees, totalCollections] = await Promise.all([
            prisma.user.count({
                where: {
                    ownerId: user.id,
                    isOnDuty: true,
                },
            }),
            prisma.collection.aggregate({
                where: {
                    shop: { ownerId: user.id },
                    collectedAt: { gte: today },
                },
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        return NextResponse.json({
            activeEmployees,
            todayCollection: totalCollections._sum.amount || 0,
            todayCount: totalCollections._count,
        });
    } catch (error) {
        console.error('Owner dashboard error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
