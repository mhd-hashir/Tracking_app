
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function POST(request: Request) {
    const user = await verifyToken(request);

    // Even if token is invalid, we proceed to return success (client is logging out anyway)
    // But we only log if we identified the user.
    if (user) {
        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `User logged out (Mobile): ${user.email}`,
                userId: user.id
            }
        });
    }

    return NextResponse.json({ success: true });
}
