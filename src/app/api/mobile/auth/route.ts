
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, encrypt } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return 401 for security, even if user not found
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate session token (reuse existing logic)
        // We treat this token as a long-lived API token for the mobile app for now
        // or the app can refresh it. The `encrypt` function sets 24h exp.
        const token = await encrypt({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isOnDuty: user.isOnDuty,
            },
        });

    } catch (error) {
        console.error('Mobile login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
