
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '../../utils';
import bcrypt from 'bcryptjs';

// GET: List all owners
export async function GET(req: Request) {
    try {
        const auth = await verifyMobileToken(req);
        if (!auth || auth.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const owners = await prisma.user.findMany({
            where: { role: 'OWNER' },
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        employees: true,
                        shops: true,
                        routes: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ owners });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new owner
export async function POST(req: Request) {
    try {
        const auth = await verifyMobileToken(req);
        if (!auth || auth.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, password, mobile } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newOwner = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                mobile,
                role: 'OWNER',
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        return NextResponse.json({ owner: newOwner }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
