'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function getLiveDashboardData() {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') {
        throw new Error('Unauthorized')
    }

    const employees = await prisma.user.findMany({
        where: {
            ownerId: session.user.id,
            role: 'EMPLOYEE'
        },
        select: {
            id: true,
            name: true,
            email: true,
            lastLatitude: true,
            lastLongitude: true,
            lastLocationUpdate: true,
            isOnDuty: true
        }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const historyData = await prisma.locationHistory.findMany({
        where: {
            timestamp: { gte: today },
            employee: { ownerId: session.user.id }
        },
        orderBy: { timestamp: 'asc' }
    })

    // Group paths
    const historyPaths: { [key: string]: [number, number][] } = {}
    historyData.forEach(h => {
        if (!historyPaths[h.employeeId]) historyPaths[h.employeeId] = []
        historyPaths[h.employeeId].push([h.latitude, h.longitude])
    })

    const collectionPoints = await prisma.collection.findMany({
        where: {
            shop: { ownerId: session.user.id },
            collectedAt: { gte: today }
        },
        include: { shop: true, employee: true }
    })

    const shops = await prisma.shop.findMany({
        where: { ownerId: session.user.id }
    })

    return {
        employees,
        historyPaths,
        collectionPoints,
        shops
    }
}
