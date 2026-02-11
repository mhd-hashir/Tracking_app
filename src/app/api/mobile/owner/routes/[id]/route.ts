
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../../utils';

// GET: Fetch single route details
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const route = await prisma.route.findUnique({
            where: { id },
            include: {
                stops: {
                    orderBy: { order: 'asc' },
                    include: { shop: true }
                }
            }
        });

        if (!route || route.ownerId !== user.id) {
            return NextResponse.json({ error: 'Route not found' }, { status: 404 });
        }

        return NextResponse.json({ route });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// PUT: Update Route (Name, Days, Stops)
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const body = await request.json();
        const { name, dayOfWeek, orderedShopIds } = body;

        // orderedShopIds should be an array of shop IDs in order

        // Transaction to update route and stops
        const updatedRoute = await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            const route = await tx.route.update({
                where: { id },
                data: {
                    name,
                    dayOfWeek: dayOfWeek // e.g., "MONDAY,TUESDAY"
                }
            });

            // 2. Update Stops if provided
            if (orderedShopIds && Array.isArray(orderedShopIds)) {
                // Remove existing stops
                await tx.routeStop.deleteMany({
                    where: { routeId: id }
                });

                // Add new stops
                // Note: orderedShopIds is array of strings (shopIds)
                await tx.routeStop.createMany({
                    data: orderedShopIds.map((shopId: string, index: number) => ({
                        routeId: id,
                        shopId,
                        order: index + 1
                    }))
                });
            }

            return route;
        });

        return NextResponse.json({ route: updatedRoute });
    } catch (error) {
        console.error('Update route error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// DELETE: Delete Route
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        await prisma.route.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete route error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
