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
    // Prioritize Owner's specific domain, fallback to Global Settings
    const settings = await getGlobalSettings()
    const owner = await prisma.user.findUnique({ where: { id: session.user.id } })

    let defaultDomain = settings.defaultDomain
    if (owner?.ownedDomain) {
        defaultDomain = owner.ownedDomain
    }

    let email = formData.get('email') as string
    const username = formData.get('username') as string

    if (username) {
        email = `${username}@${defaultDomain}`
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
    // Prioritize Owner's specific domain, fallback to Global Settings
    const settings = await getGlobalSettings()
    const owner = await prisma.user.findUnique({ where: { id: session.user.id } })

    let defaultDomain = settings.defaultDomain
    if (owner?.ownedDomain) {
        defaultDomain = owner.ownedDomain
    }

    let email = formData.get('email') as string
    const username = formData.get('username') as string

    if (username) {
        email = `${username}@${defaultDomain}`
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

export async function updateEmployeeRoutesAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const employeeId = formData.get('employeeId') as string
    if (!employeeId) return { error: 'Employee ID required' }

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

    try {
        // Verify ownership
        const emp = await prisma.user.findFirst({
            where: { id: employeeId, ownerId: session.user.id }
        })
        if (!emp) return { error: 'Employee not found' }

        // Process each day
        for (const day of days) {
            const routeId = formData.get(`route_${day}`) as string

            // 1. Unassign any existing route for this employee on this day
            //    (User allows "no route" on assigned days if unselected)
            await prisma.route.updateMany({
                where: {
                    assignedToId: employeeId,
                    dayOfWeek: { contains: day },
                    ownerId: session.user.id
                },
                data: { assignedToId: null }
            })

            // 2. Assign new route if selected
            if (routeId && routeId !== 'NONE') {
                // Verify route belongs to owner and matches day
                const route = await prisma.route.findFirst({
                    where: {
                        id: routeId,
                        ownerId: session.user.id,
                        dayOfWeek: { contains: day }
                    }
                })

                if (route) {
                    await prisma.route.update({
                        where: { id: routeId },
                        data: { assignedToId: employeeId }
                    })
                }
            }
        }

        revalidatePath('/owner/employees')
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: 'Failed to update routes' }
    }
}
