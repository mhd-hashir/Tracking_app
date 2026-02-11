
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

        const { latitude, longitude, timestamp } = await request.json();

        if (latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        // Only update if employee is on duty
        if (!user.isOnDuty) {
            // Technically we might want to log even if off duty for debugging?
            // But for privacy/policy, usually only track when On Duty.
            // Let's assume we log anyway for now but maybe flag it? Or just silently succeed.
            // The user requirement says "application is using the location service all time so that the path of the employee can be tracked completly".
            // So I will log it regardless of isOnDuty status, but maybe the frontend will only send when tracking is on.
            // Actually, the requirement says "path of the employee can be tracked completly", so I will log it.
        }

        // 1. Save to LocationHistory
        await prisma.locationHistory.create({
            data: {
                employeeId: user.id,
                latitude,
                longitude,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });

        // 2. Update User's last known location
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLatitude: latitude,
                lastLongitude: longitude,
                lastLocationUpdate: new Date(),
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Tracking error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
