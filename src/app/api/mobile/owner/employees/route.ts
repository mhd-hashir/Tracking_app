
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../utils';
import { hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const employees = await prisma.user.findMany({
            where: { ownerId: user.id, role: 'EMPLOYEE' },
            select: {
                id: true,
                name: true,
                email: true,
                isOnDuty: true,
                lastLatitude: true,
                lastLongitude: true,
                lastLocationUpdate: true,
            },
        });

        return NextResponse.json({ employees });
    } catch (error) {
        console.error('Owner employees error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, username, password } = body;

        if (!name || !username || !password) {
            return NextResponse.json({ error: 'Name, username, and password are required' }, { status: 400 });
        }

        // Domain Logic
        const settings = await prisma.globalSettings.findFirst();
        const defaultDomain = user.ownedDomain || settings?.defaultDomain || 'fieldtrack.com';
        const email = `${username}@${defaultDomain}`;

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newEmployee = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'EMPLOYEE',
                ownerId: user.id,
            },
        });

        return NextResponse.json({ success: true, employee: newEmployee });

    } catch (error) {
        console.error('Create employee error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
