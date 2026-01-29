import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const adminEmail = 'admin@fieldtrack.com'
    const adminPass = 'admin123'

    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (!existingAdmin) {
            const hashedPassword = await hashPassword(adminPass)
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Super Admin',
                    role: 'ADMIN'
                }
            })
            return NextResponse.json({ message: 'Admin created' })
        }
        return NextResponse.json({ message: 'Admin already exists' })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
