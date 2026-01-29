'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function updateLocationAction(latitude: number, longitude: number) {
    const session = await getSession()
    if (!session || session.user.role !== 'EMPLOYEE') {
        return { error: 'Unauthorized' }
    }

    try {
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
