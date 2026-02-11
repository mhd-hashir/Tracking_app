
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const settings = await prisma.globalSettings.findFirst();
        const defaultDomain = user.ownedDomain || settings?.defaultDomain || 'fieldtrack.com';

        return NextResponse.json({ domain: defaultDomain });
    } catch (error) {
        console.error('Settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
