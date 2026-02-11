
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Total Owners
        const totalOwners = await prisma.user.count({ where: { role: 'OWNER' } });

        // 2. Active Owners (Subscription ACTIVE)
        const activeOwners = await prisma.user.count({
            where: { role: 'OWNER', subscriptionStatus: 'ACTIVE' }
        });

        // 3. Total Employees
        const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });

        // 4. Total Revenue (Sum of all Collections)
        const totalRevenue = await prisma.collection.aggregate({
            _sum: { amount: true }
        });

        // 5. Recent System Logs
        const recentLogs = await prisma.systemLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            stats: {
                totalOwners,
                activeOwners,
                totalEmployees,
                totalRevenue: totalRevenue._sum.amount || 0
            },
            recentLogs
        });

    } catch (error) {
        console.error('System Stats Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
