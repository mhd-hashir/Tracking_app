
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const broadcasts = await prisma.broadcast.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        return NextResponse.json({ broadcasts });
    } catch (error) {
        console.error('Broadcast fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
