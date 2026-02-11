
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

// GET: List all routes for this owner
export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const routes = await prisma.route.findMany({
            where: { ownerId: user.id },
            include: {
                assignedTo: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { stops: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ routes });
    } catch (error) {
        console.error('Get routes error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// POST: Create a new route
export async function POST(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, assignedToId, shopIds } = body; // shopIds is array of strings

        if (!name) {
            return NextResponse.json({ error: 'Route name is required' }, { status: 400 });
        }

        // Transaction to create route and stops
        const route = await prisma.$transaction(async (tx) => {
            // 1. Create Route
            const newRoute = await tx.route.create({
                data: {
                    name,
                    dayOfWeek: 'MONDAY', // Default for now, or add to input
                    ownerId: user.id,
                    assignedToId: assignedToId || null,
                }
            });

            // 2. Create Stops
            if (shopIds && Array.isArray(shopIds) && shopIds.length > 0) {
                // Create stops in order
                await tx.routeStop.createMany({
                    data: shopIds.map((shopId: string, index: number) => ({
                        routeId: newRoute.id,
                        shopId: shopId,
                        order: index + 1
                    }))
                });
            }

            return newRoute;
        });

        return NextResponse.json({ route });
    } catch (error) {
        console.error('Create route error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
