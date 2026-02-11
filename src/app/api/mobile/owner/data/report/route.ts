
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../../utils'; // Correct path to src/app/api/mobile/utils.ts

// POST /api/mobile/owner/data/report
export async function POST(req: NextRequest) {
    const user = await verifyToken(req);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { startDate, endDate, shopId, employeeId, paymentMode } = body;

        const where: any = {
            shop: { ownerId: user.id }, // Ensure collections belong to owner's shops
            collectedAt: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        };

        if (shopId && shopId !== 'ALL') where.shopId = shopId;
        if (employeeId && employeeId !== 'ALL') where.employeeId = employeeId;
        if (paymentMode && paymentMode !== 'ALL') where.paymentMode = paymentMode;

        const collections = await prisma.collection.findMany({
            where,
            include: {
                shop: { select: { name: true } },
                employee: { select: { name: true } }
            },
            orderBy: { collectedAt: 'desc' }
        });

        // Calculate Summary
        const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
        const transactionCount = collections.length;

        // Format Data
        const data = collections.map(c => ({
            id: c.id,
            date: c.collectedAt.toISOString().split('T')[0],
            time: c.collectedAt.toLocaleTimeString(),
            shopName: c.shop.name,
            amount: c.amount,
            collectedBy: c.employee?.name || 'Unknown',
            paymentMode: c.paymentMode,
            notes: c.remarks
        }));

        return NextResponse.json({
            summary: { totalCollected, transactionCount },
            data
        });

    } catch (error) {
        console.error('Report Error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
