
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../../../../utils';

// GET: Fetch employee duty logs
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const user = await verifyToken(request);
    if (!user || user.role !== 'OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        // Verify employee belongs to owner
        const employee = await prisma.user.findFirst({
            where: { id, ownerId: user.id }
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        const logs = await prisma.dutyLog.findMany({
            where: { employeeId: id },
            orderBy: { timestamp: 'desc' },
            take: 50 // Limit to last 50 entries
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Fetch duty logs error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
