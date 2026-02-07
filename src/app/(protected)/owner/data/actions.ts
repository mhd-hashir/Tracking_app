'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

type FilterOptions = {
    shopId?: string | 'ALL'
    employeeId?: string | 'ALL'
    paymentMode?: string | 'ALL'
}

export async function getFilterOptions() {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { shops: [], employees: [] }

    const shops = await prisma.shop.findMany({
        where: { ownerId: session.user.id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    const employees = await prisma.user.findMany({
        where: { ownerId: session.user.id, role: 'EMPLOYEE' },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    return { shops, employees }
}

export async function getCollectionsReport(startDate: Date, endDate: Date, filters?: FilterOptions) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    // Ensure dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { error: 'Invalid date range' }
    }

    // Set end date to end of day
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // Build Query
    const whereClause: any = {
        shop: { ownerId: session.user.id },
        collectedAt: {
            gte: startDate,
            lte: end
        }
    }

    if (filters?.shopId && filters.shopId !== 'ALL') {
        whereClause.shopId = filters.shopId
    }

    if (filters?.employeeId && filters.employeeId !== 'ALL') {
        whereClause.employeeId = filters.employeeId
    }

    if (filters?.paymentMode && filters.paymentMode !== 'ALL') {
        whereClause.paymentMode = filters.paymentMode
    }

    const collections = await prisma.collection.findMany({
        where: whereClause,
        include: {
            shop: {
                select: { name: true, dueAmount: true }
            },
            employee: {
                select: { name: true }
            }
        },
        orderBy: { collectedAt: 'desc' }
    })

    // Calculate Summary
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0)

    // Flatten for UI/Export
    const flatData = collections.map(c => ({
        id: c.id,
        Date: c.collectedAt.toLocaleDateString(),
        Time: c.collectedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'Shop Name': c.shop.name,
        'Collected Amount': c.amount,
        'Payment Mode': c.paymentMode,
        'Current Due': c.shop.dueAmount,
        'Collected By': c.employee.name,
        Remarks: c.remarks || '-'
    }))

    return {
        summary: {
            totalCollected,
            transactionCount: collections.length
        },
        data: flatData
    }
}
