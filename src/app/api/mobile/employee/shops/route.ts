
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'EMPLOYEE') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all shops under the same owner
        // Useful for ad-hoc visits outside of assigned routes
        const shops = await prisma.shop.findMany({
            where: {
                ownerId: user.ownerId!, // Employee must have an ownerId
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ shops });
    } catch (error) {
        console.error('Employee shops error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
