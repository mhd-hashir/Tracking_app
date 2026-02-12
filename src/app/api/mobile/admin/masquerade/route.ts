
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken, signToken } from '../../utils';

export async function POST(req: Request) {
    try {
        const auth = await verifyToken(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ownerId } = await req.json();
        if (!ownerId) {
            return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 });
        }

        const owner = await prisma.user.findUnique({
            where: { id: ownerId, role: 'OWNER' }
        });

        if (!owner) {
            return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
        }

        // Generate a new token for this owner
        // This effectively logs the admin in as the owner on the mobile client
        const token = signToken({
            id: owner.id,
            email: owner.email,
            role: owner.role,
            ownerId: owner.ownerId // likely null for owner
        });

        return NextResponse.json({
            token,
            user: {
                id: owner.id,
                email: owner.email,
                name: owner.name,
                role: owner.role,
                isOnDuty: owner.isOnDuty
            }
        });

    } catch (error: any) {
        console.error('Masquerade error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
