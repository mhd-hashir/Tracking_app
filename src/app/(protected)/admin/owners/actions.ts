'use server'

import { prisma } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createOwnerAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password || !name) {
        return { error: 'All fields are required' }
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return { error: 'Email already exists' }
        }

        const hashedPassword = await hashPassword(password)
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'OWNER',
            },
        })

        revalidatePath('/admin/owners')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Failed to create owner' }
    }
}
