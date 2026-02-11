
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function POST(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { shopId, amount, paymentMode, remarks, latitude, longitude } = body;

        if (!shopId || amount === undefined || !paymentMode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Collection Record
        const collection = await prisma.collection.create({
            data: {
                amount: Number(amount),
                paymentMode,
                remarks,
                latitude,
                longitude,
                shopId,
                employeeId: user.id,
            }
        });

        // 2. Update Shop Balance (Decrease due amount)
        // Assuming payment reduces the due amount.
        await prisma.shop.update({
            where: { id: shopId },
            data: {
                dueAmount: { decrement: Number(amount) }
            }
        });

        return NextResponse.json({ success: true, collection });
    } catch (error) {
        console.error('Collection submit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
