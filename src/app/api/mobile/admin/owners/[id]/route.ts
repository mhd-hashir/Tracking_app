
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '../../utils';
import bcrypt from 'bcryptjs';

// GET: Get specific owner details
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await verifyMobileToken(req);
        if (!auth || auth.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Await params if necessary in newer Next.js versions, strictly speaking params is generic here so we access directly or await if it's a promise in future
        // In current context, params is likely an object.
        const { id } = await params;

        const owner = await prisma.user.findUnique({
            where: { id, role: 'OWNER' },
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
            }
        });

        if (!owner) {
            return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
        }

        return NextResponse.json(owner);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update specific owner
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await verifyMobileToken(req);
        if (!auth || auth.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, email, mobile, isActive, password } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (mobile) updateData.mobile = mobile;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedOwner = await prisma.user.update({
            where: { id, role: 'OWNER' },
            data: updateData,
            select: { id: true, name: true, isActive: true }
        });

        return NextResponse.json(updatedOwner);

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 });
    }
}

// DELETE: Remove owner
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const auth = await verifyMobileToken(req);
        if (!auth || auth.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.user.delete({
            where: { id, role: 'OWNER' }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete owner' }, { status: 500 });
    }
}
