
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../../utils';
import { hashPassword } from '@/lib/auth';

// GET: Fetch single employee
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const employee = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isOnDuty: true,
                role: true,
                ownerId: true
            }
        });

        if (!employee || employee.ownerId !== user.id || employee.role !== 'EMPLOYEE') {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json({ employee });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// PUT: Update Employee
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const body = await request.json();
        const { name, password, isOnDuty } = body;

        // Verify ownership
        const employee = await prisma.user.findFirst({
            where: { id, ownerId: user.id, role: 'EMPLOYEE' }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const data: any = { name };
        if (password) {
            data.password = await hashPassword(password);
        }
        if (typeof isOnDuty === 'boolean') {
            data.isOnDuty = isOnDuty;
        }

        const updatedEmployee = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, isOnDuty: true }
        });

        return NextResponse.json({ employee: updatedEmployee });
    } catch (error) {
        console.error('Update employee error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// DELETE: Delete Employee
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        // Verify ownership
        const employee = await prisma.user.findFirst({
            where: { id, ownerId: user.id }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete employee error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
