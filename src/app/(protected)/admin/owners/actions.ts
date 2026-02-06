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

export async function updateOwnerAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' }

    const ownerId = formData.get('ownerId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email) return { error: 'All fields are required' }

    const data: any = { name, email }

    if (password && password.trim() !== '') {
        data.password = await hashPassword(password)
    }

    try {
        await prisma.user.update({
            where: { id: ownerId },
            data
        })
        revalidatePath('/admin/owners')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to update owner' }
    }
}

export async function deleteOwnerAction(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' }

    const ownerId = formData.get('ownerId') as string

    try {
        await prisma.user.delete({
            where: { id: ownerId }
        })
        revalidatePath('/admin/owners')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to delete owner' }
    }
}

export async function updateEmployeeByAdminAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' }

    const employeeId = formData.get('employeeId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email) return { error: 'Name and Email are required' }

    const data: any = { name, email }

    if (password && password.trim() !== '') {
        data.password = await hashPassword(password)
    }

    try {
        await prisma.user.update({
            where: { id: employeeId },
            data
        })
        revalidatePath('/admin/owners') // Revalidate parent lists if needed
        return { success: true }
    } catch (e) {
        return { error: 'Failed to update employee' }
    }
}

export async function deleteEmployeeByAdminAction(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') return { error: 'Unauthorized' }

    const employeeId = formData.get('employeeId') as string

    try {
        await prisma.user.delete({
            where: { id: employeeId }
        })
        return { success: true }
    } catch (e) {
        return { error: 'Failed to delete employee' }
    }
}
