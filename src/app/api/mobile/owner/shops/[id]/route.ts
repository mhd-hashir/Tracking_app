
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../../utils';

// PUT: Update Shop
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const body = await request.json();
        const { name, address, mobile, dueAmount, latitude, longitude } = body;

        // Verify ownership
        const shop = await prisma.shop.findFirst({
            where: { id, ownerId: user.id }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        const updatedShop = await prisma.shop.update({
            where: { id },
            data: {
                name,
                address,
                mobile,
                dueAmount: Number(dueAmount),
                latitude,
                longitude
            }
        });

        return NextResponse.json({ shop: updatedShop });
    } catch (error) {
        console.error('Update shop error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// DELETE: Delete Shop
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        // Verify ownership
        const shop = await prisma.shop.findFirst({
            where: { id, ownerId: user.id }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        await prisma.shop.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete shop error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
