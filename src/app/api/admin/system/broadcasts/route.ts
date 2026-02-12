
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: Fetch Active Broadcasts
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const broadcasts = await prisma.broadcast.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ broadcasts });
}

// POST: Create Broadcast (Admin Only)
export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, message } = await request.json();

        const broadcast = await prisma.broadcast.create({
            data: { title, message }
        });

        // Log action
        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `Broadcast created: ${title}`,
                userId: session.user.id
            }
        });

        return NextResponse.json({ broadcast });
    } catch (error: any) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create broadcast' }, { status: 500 });
    }
}
