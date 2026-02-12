
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

export async function POST(request: Request) {
    const user = await verifyToken(request);

    // Check if user exists and is an ADMIN
    // Note: The mobile app admin is logged in as 'ADMIN'. 
    // We should verify role. verifyToken returns the user object from DB.
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, message } = await request.json();

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        const broadcast = await prisma.broadcast.create({
            data: { title, message }
        });

        // Log action (optional, but good for consistency)
        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `Broadcast created via Mobile: ${title}`,
                userId: user.id
            }
        });

        return NextResponse.json({ broadcast });

    } catch (error: any) {
        console.error('Broadcast creation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create broadcast' }, { status: 500 });
    }
}
