
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

// GET: List all shops owned by the user
export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const shops = await prisma.shop.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ shops });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// POST: Create a new shop
export async function POST(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, address, mobile, dueAmount, latitude, longitude } = body;

        if (!name) {
            return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
        }

        const shop = await prisma.shop.create({
            data: {
                name,
                address,
                mobile,
                dueAmount: Number(dueAmount) || 0,
                latitude,
                longitude,
                ownerId: user.id
            }
        });

        return NextResponse.json({ shop });
    } catch (error) {
        console.error('Create shop error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
