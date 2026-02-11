'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateLocationAction(latitude: number, longitude: number) {
    const session = await getSession()
    if (!session || session.user.role !== 'EMPLOYEE') {
        return { error: 'Unauthorized' }
    }

    try {
        // Enforce duty status check
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isOnDuty: true }
        })

        if (!user?.isOnDuty) {
            return { error: 'User is off duty' }
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: {
                    lastLatitude: latitude,
                    lastLongitude: longitude,
                    lastLocationUpdate: new Date()
                }
            }),
            prisma.locationHistory.create({
                data: {
                    employeeId: session.user.id,
                    latitude,
                    longitude
                }
            })
        ])
        return { success: true }
    } catch (error) {
        console.error('Failed to update location:', error)
        return { error: 'Failed to update location' }
    }
}

// ... (imports)

export async function toggleDutyAction(isOnDuty: boolean, latitude?: number, longitude?: number) {
    const session = await getSession()
    if (!session || session.user.role !== 'EMPLOYEE') return { error: 'Unauthorized' }

    try {
        // 1. Update User Status (Critical)
        await prisma.user.update({
            where: { id: session.user.id },
            data: { isOnDuty }
        })

        // 2. Try to Log (Best Effort - might fail if DB schema is outdated)
        try {
            await prisma.dutyLog.create({
                data: {
                    employeeId: session.user.id,
                    status: isOnDuty ? 'ON' : 'OFF',
                    latitude,
                    longitude
                }
            })
        } catch (logError) {
            console.warn('Failed to create duty log (Schema mismatch?):', logError)
            // Do not fail the main action
        }

        revalidatePath('/employee')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle duty:', error)
        return { error: 'Failed to toggle duty status' }
    }
}
