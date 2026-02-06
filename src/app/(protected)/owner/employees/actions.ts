'use server'

import { prisma } from '@/lib/db'
import { getSession, hashPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

import { getGlobalSettings } from '../../admin/settings/actions'

export async function addEmployeeAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const password = formData.get('password') as string

    // Domain Logic
    const settings = await getGlobalSettings()
    let email = formData.get('email') as string
    const username = formData.get('username') as string

    if (username) {
        email = `${username}@${settings.defaultDomain}`
    }

    if (!email || !password || !name) {
        return { error: 'All fields are required' }
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return { error: 'User already exists' }
        }

        const hashedPassword = await hashPassword(password)
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'EMPLOYEE',
                ownerId: session.user.id,
            },
        })

        revalidatePath('/owner/employees')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Failed to add employee' }
    }
}

export async function updateEmployeeAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const employeeId = formData.get('employeeId') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string

    // Domain Logic
    const settings = await getGlobalSettings()
    let email = formData.get('email') as string
    const username = formData.get('username') as string

    if (username) {
        email = `${username}@${settings.defaultDomain}`
    }

    if (!name || !email) return { error: 'Name and Email/Username are required' }

    const data: any = { name, email }

    if (password && password.trim() !== '') {
        data.password = await hashPassword(password)
    }

    try {
        // Verify ownership
        const emp = await prisma.user.findFirst({
            where: { id: employeeId, ownerId: session.user.id }
        })

        if (!emp) return { error: 'Employee not found' }

        await prisma.user.update({
            where: { id: employeeId },
            data
        })

        revalidatePath('/owner/employees')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to update employee' }
    }
}

export async function deleteEmployeeAction(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const employeeId = formData.get('employeeId') as string

    try {
        // Verify ownership before delete
        const emp = await prisma.user.findFirst({
            where: { id: employeeId, ownerId: session.user.id }
        })

        if (!emp) return { error: 'Employee not found' }

        await prisma.user.delete({
            where: { id: employeeId }
        })

        revalidatePath('/owner/employees')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to delete employee' }
    }
}
