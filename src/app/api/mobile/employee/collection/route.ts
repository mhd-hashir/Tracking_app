
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
        return NextResponse.json({ error: 'Shop ID required' }, { status: 400 });
    }

    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const collection = await prisma.collection.findFirst({
            where: {
                shopId,
                employeeId: user.id,
                collectedAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        return NextResponse.json({ collection });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { shopId, amount, paymentMode, remarks, latitude, longitude } = body;

        // Allow amount 0 only if remarks exists
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

        // 2. Update Shop Balance
        if (Number(amount) > 0) {
            await prisma.shop.update({
                where: { id: shopId },
                data: {
                    dueAmount: { decrement: Number(amount) }
                }
            });
        }

        return NextResponse.json({ success: true, collection });
    } catch (error) {
        console.error('Collection submit error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, amount, paymentMode, remarks } = body;

        if (!id || amount === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const newAmount = Number(amount);

        // Transaction to update collection and shop balance
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get old collection to adjust balance
            const oldCollection = await tx.collection.findUnique({
                where: { id }
            });

            if (!oldCollection || oldCollection.employeeId !== user.id) {
                throw new Error('Collection not found or unauthorized');
            }

            // 2. Update Collection
            const updatedCollection = await tx.collection.update({
                where: { id },
                data: {
                    amount: newAmount,
                    paymentMode,
                    remarks,
                    isEdited: true // Requires Schema Update
                }
            });

            // 3. Update Shop Balance (Revert old, Apply new)
            // If old amount was 100, we add it back (increment).
            // Then subtract new amount (decrement).
            // Net: dueAmount + oldAmount - newAmount
            const diff = oldCollection.amount - newAmount; // e.g. 100 - 150 = -50 (Due should decrease by additional 50)

            // Prisma increment/decrement logic:
            // dueAmount: { increment: oldCollection.amount, decrement: newAmount } ?
            // Better: dueAmount: { increment: oldCollection.amount - newAmount } 

            await tx.shop.update({
                where: { id: oldCollection.shopId },
                data: {
                    dueAmount: { increment: diff }
                }
            });

            return updatedCollection;
        });

        return NextResponse.json({ success: true, collection: result });
    } catch (error: any) {
        console.error('Collection update error:', error);
        return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
    }
}
