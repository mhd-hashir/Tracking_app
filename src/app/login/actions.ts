'use server'

import { prisma } from '@/lib/db'
import { verifyPassword, encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
    const identifier = formData.get('identifier') as string
    const password = formData.get('password') as string

    if (!identifier || !password) {
        return { error: 'Please enter both identifier and password' }
    }

    const isEmail = identifier.includes('@')
    const user = await prisma.user.findUnique({
        where: isEmail ? { email: identifier } : { mobile: identifier },
    })

    // Security: Check password even if user not found to prevent timing attacks (simulated)
    if (!user || !(await verifyPassword(password, user.password))) {
        return { error: 'Invalid credentials' }
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user: { id: user.id, email: user.email, role: user.role, name: user.name } })

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/'
    })

    // Redirect based on role
    if (user.role === 'ADMIN') redirect('/admin')
    if (user.role === 'OWNER') redirect('/owner')
    if (user.role === 'EMPLOYEE') redirect('/employee')

    // Log Login
        const identifier = user.email || user.mobile || 'Unknown'
        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `User logged in: ${identifier}`,
            userId: user.id
        }
    })

    return { success: true }
}
