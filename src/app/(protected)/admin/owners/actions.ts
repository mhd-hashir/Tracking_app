'use server'

import { prisma } from '@/lib/db'
import { getSession, hashPassword, verifyPassword, encrypt } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getGlobalSettings } from '../settings/actions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createOwnerAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const username = formData.get('username') as string
    const domain = formData.get('domain') as string
    const ownedDomain = (formData.get('ownedDomain') as string)?.trim() || null
    const password = formData.get('password') as string

    // Subscription details
    const planType = formData.get('planType') as string || 'FREE'
    const subscriptionStatus = formData.get('subscriptionStatus') as string || 'ACTIVE'
    const subscriptionExpiry = formData.get('subscriptionExpiry') as string

    if (!username || !domain || !password || !name) {
        return { error: 'All fields are required' }
    }

    try {
        // Construct email from default/selected domain (not necessarily the forced custom one)
        // The form uses 'domain' for the email suffix.
        const email = `${username}@${domain}`

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
                role: 'OWNER',
                ownedDomain, // This is the forced custom domain for their sub-users
                planType,
                subscriptionStatus,
                subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : null
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
    const domain = (formData.get('domain') as string)?.trim()
    const password = formData.get('password') as string
    const ownedDomain = (formData.get('ownedDomain') as string)?.trim() || null

    const planType = formData.get('planType') as string || 'FREE'
    const subscriptionStatus = formData.get('subscriptionStatus') as string || 'ACTIVE'
    const subscriptionExpiry = formData.get('subscriptionExpiry') as string

    if (!name || !email) return { error: 'All fields are required' }

    const data: any = {
        name,
        email,
        ownedDomain: ownedDomain && ownedDomain.trim() !== '' ? ownedDomain : null,
        planType,
        subscriptionStatus,
        subscriptionExpiry: subscriptionExpiry ? new Date(subscriptionExpiry) : null
    }

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
    const adminPassword = formData.get('adminPassword') as string

    if (!adminPassword) return { error: 'Admin password required' }

    try {
        // Verify Admin Password
        const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!adminUser) return { error: 'Admin not found' }

        const valid = await verifyPassword(adminPassword, adminUser.password)
        if (!valid) return { error: 'Invalid admin password' }

        // Proceed to delete
        await prisma.user.delete({
            where: { id: ownerId }
        })
        revalidatePath('/admin/owners')
        return { success: true }
    } catch (e) {
        console.error(e)
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

export async function masqueradeAsOwner(ownerId: string) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    const owner = await prisma.user.findUnique({
        where: { id: ownerId, role: 'OWNER' }
    })

    if (!owner) {
        throw new Error('Owner not found')
    }

    // Create session for the owner
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const newSession = await encrypt({
        user: {
            id: owner.id,
            email: owner.email,
            role: owner.role,
            name: owner.name
        }
    })

    const cookieStore = await cookies()
    cookieStore.set('session', newSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/'
    })

    redirect('/owner')
}
