'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function getCollectionsReport(startDate: Date, endDate: Date) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    // Ensure dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { error: 'Invalid date range' }
    }

    // Set end date to end of day
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const collections = await prisma.collection.findMany({
        where: {
            shop: { ownerId: session.user.id },
            collectedAt: {
                gte: startDate,
                lte: end
            }
        },
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

    // Group by Shop for "Remaining Amount" context (optional, but requested)
    // The request asked: "how much each shop payed what is the remaining amount each shops should give"
    // Since 'dueAmount' is current status, we just show that.

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
