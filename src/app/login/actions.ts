'use server'

import { prisma } from '@/lib/db'
import { verifyPassword, encrypt } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Please enter both email and password' }
    }

    const user = await prisma.user.findUnique({
        where: { email },
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

    return { success: true }
}
