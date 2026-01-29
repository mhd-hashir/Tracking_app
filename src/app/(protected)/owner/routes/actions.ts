'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createRouteAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const dayOfWeek = formData.get('dayOfWeek') as string
    const shopIds = formData.getAll('shopIds') as string[] // Checkbox values

    if (!name || !dayOfWeek) return { error: 'Name and Day required' }

    try {
        const route = await prisma.route.create({
            data: {
                name,
                dayOfWeek,
                ownerId: session.user.id,
                stops: {
                    create: shopIds.map((shopId, index) => ({
                        shopId,
                        order: index
                    }))
                }
            }
        })
        revalidatePath('/owner/routes')
        return { success: true }
    } catch (e) {
        return { error: 'Failed to create route' }
    }
}
