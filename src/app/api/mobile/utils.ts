
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-it'; // Must match auth.ts
const key = new TextEncoder().encode(SECRET_KEY);

// verifyToken is already exported.
export async function verifyToken(request: Request) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });

        // Ensure payload user id exists, casting to expected type
        const userData = payload.user as { id: string } | undefined;
        if (!userData?.id) return null;

        // Double check against DB
        const user = await prisma.user.findUnique({
            where: { id: userData.id }
        });

        if (!user) return null;

        return user;
    } catch (error) {
        return null;
    }
}
