
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '../utils';

export async function POST(request: Request) {
    try {
        const user = await verifyToken(request);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { isOnDuty, latitude, longitude } = await request.json();

        if (typeof isOnDuty !== 'boolean') {
            return NextResponse.json(
                { error: 'isOnDuty must be a boolean' },
                { status: 400 }
            );
        }

        // Update User status
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { isOnDuty },
        });

        // Create a DutyLog entry
        await prisma.dutyLog.create({
            data: {
                employeeId: user.id,
                status: isOnDuty ? 'ON' : 'OFF',
                latitude: latitude || null,
                longitude: longitude || null,
                timestamp: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            isOnDuty: updatedUser.isOnDuty
        });

    } catch (error) {
        console.error('Duty toggle error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
