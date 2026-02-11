
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '../../utils';

export async function GET(req: Request) {
    try {
        const auth = await verifyMobileToken(req);
        if (!auth || auth.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [totalOwners, activeOwners] = await Promise.all([
            prisma.user.count({ where: { role: 'OWNER' } }),
            prisma.user.count({ where: { role: 'OWNER', isActive: true } }),
        ]);

        return NextResponse.json({
            totalOwners,
            activeOwners,
            inactiveOwners: totalOwners - activeOwners
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
