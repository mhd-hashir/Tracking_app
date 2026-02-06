'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getGlobalSettings() {
    // Singleton pattern: Get the first row, or create if empty
    let settings = await prisma.globalSettings.findFirst()
    if (!settings) {
        settings = await prisma.globalSettings.create({
            data: {
                defaultDomain: 'fieldtrack.com'
            }
        })
    }
    return settings
}

export async function updateGlobalDomain(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    const domain = formData.get('domain') as string
    if (!domain || !domain.includes('.')) {
        return { error: 'Invalid domain format (e.g., example.com)' }
    }

    // Ensure strictly domain format (remove @ if user added it)
    const cleanDomain = domain.replace('@', '').trim()

    try {
        const settings = await getGlobalSettings()
        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: { defaultDomain: cleanDomain }
        })

        revalidatePath('/admin/settings')
        revalidatePath('/admin/owners') // Revalidate places where we might add users
        return { success: true }
    } catch (e) {
        return { error: 'Failed to update domain' }
    }
}
