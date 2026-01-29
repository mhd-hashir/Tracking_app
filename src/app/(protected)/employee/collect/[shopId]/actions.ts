'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitCollectionAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'EMPLOYEE') return { error: 'Unauthorized' }

    const shopId = formData.get('shopId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paymentMode = formData.get('paymentMode') as string
    const remarks = formData.get('remarks') as string

    // Location (optional, log it if available)
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null

    if (!shopId || isNaN(amount) || amount <= 0) {
        return { error: 'Valid amount is required' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Create Collection Record
            await tx.collection.create({
                data: {
                    shopId,
                    employeeId: session.user.id,
                    amount,
                    paymentMode,
                    remarks,
                    latitude,
                    longitude
                }
            })

            // Update Shop Due Amount
            await tx.shop.update({
                where: { id: shopId },
                data: {
                    dueAmount: { decrement: amount },
                    // Optionally update shop location if provided and currently null (first visit)
                    ...(latitude && longitude ? { latitude, longitude } : {})
                }
            })
        })
    } catch (e) {
        console.error(e)
        return { error: 'Transaction failed' }
    }

    redirect('/employee')
}
