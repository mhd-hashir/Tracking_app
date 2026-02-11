
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../../utils';
import bcrypt from 'bcryptjs';

// GET: Get specific owner details
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const auth = await verifyToken(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const owner = await prisma.user.findUnique({
            where: { id, role: 'OWNER' },
            select: {
                id: true,
                name: true,
                email: true,
                subscriptionStatus: true,
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
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const auth = await verifyToken(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { name, email, isActive, password } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        // Map boolean isActive to subscriptionStatus
        if (typeof isActive === 'boolean') {
            updateData.subscriptionStatus = isActive ? 'ACTIVE' : 'INACTIVE';
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedOwner = await prisma.user.update({
            where: { id, role: 'OWNER' },
            data: updateData,
            select: { id: true, name: true, subscriptionStatus: true }
        });

        return NextResponse.json(updatedOwner);

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update owner' }, { status: 500 });
    }
}

// DELETE: Remove owner
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const auth = await verifyToken(req);
        if (!auth || auth.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        await prisma.user.delete({
            where: { id, role: 'OWNER' }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete owner' }, { status: 500 });
    }
}
