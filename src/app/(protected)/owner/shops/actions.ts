'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'

export async function addShopAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const dueAmount = parseFloat(formData.get('dueAmount') as string) || 0
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const geofenceRadius = parseInt(formData.get('geofenceRadius') as string) || 500
    const mobile = formData.get('mobile') as string

    await prisma.shop.create({
        data: {
            name,
            address,
            dueAmount,
            latitude,
            longitude,
            geofenceRadius,
            mobile,
            ownerId: session.user.id
        }
    })
    revalidatePath('/owner/shops')
}



export async function updateShopAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const shopId = formData.get('shopId') as string
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const dueAmount = parseFloat(formData.get('dueAmount') as string) || 0
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const geofenceRadius = parseInt(formData.get('geofenceRadius') as string) || 500
    const mobile = formData.get('mobile') as string

    await prisma.shop.update({
        where: { id: shopId },
        data: {
            name,
            address,
            dueAmount,
            latitude,
            longitude,
            geofenceRadius,
            mobile
        }
    })
    revalidatePath('/owner/shops')
    return { success: true }
}

export async function deleteShopAction(formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const shopId = formData.get('shopId') as string

    await prisma.shop.delete({
        where: {
            id: shopId,
            ownerId: session.user.id // Extra safety check
        }
    })

    revalidatePath('/owner/shops')
    return { success: true }
}

export async function importShopsAction(data: any[]) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    // Bulk create
    // Data expected keys: Name, Address, DueAmount
    for (const row of data) {
        if (row.Name) {
            await prisma.shop.create({
                data: {
                    name: row.Name,
                    address: row.Address || '',
                    mobile: row.Mobile ? String(row.Mobile) : null,
                    dueAmount: parseFloat(row.DueAmount) || 0,
                    ownerId: session.user.id
                }
            })
        }
    }
    revalidatePath('/owner/shops')
}

export async function extractCoordinatesAction(urlInput: string) {
    if (!urlInput || !urlInput.startsWith('http')) {
        return { error: 'Invalid URL' }
    }

    try {
        const response = await fetch(urlInput, {
            redirect: 'follow',
            method: 'GET', // Changed to GET to follow redirects properly
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        const finalUrl = response.url

        const patterns = [
            /@(-?\d+\.\d+),(-?\d+\.\d+)/, // Standard @lat,lng
            /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=lat,lng
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // Embed/Share URL params
            /search\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/ // /search/Query/@lat,lng
        ]

        for (const pattern of patterns) {
            const match = finalUrl.match(pattern)
            if (match) {
                return { lat: match[1], lng: match[2] }
            }
        }

        return { error: 'Could not extract coordinates. Try sharing a "Dropped Pin" or "Map Location" link instead of a Search result.' }
    } catch (e) {
        return { error: 'Failed to resolve URL' }
    }
}

// Export Actions

export async function getShopExportData(shopId: string) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const shop = await prisma.shop.findUnique({
        where: { id: shopId, ownerId: session.user.id },
        include: {
            collections: {
                include: { employee: true },
                orderBy: { collectedAt: 'desc' }
            }
        }
    })

    if (!shop) return { error: 'Shop not found' }

    return {
        shop: {
            Name: shop.name,
            Address: shop.address,
            Mobile: shop.mobile,
            'Due Amount': shop.dueAmount,
            Latitude: shop.latitude,
            Longitude: shop.longitude,
            'Created At': shop.createdAt.toISOString().split('T')[0]
        },
        collections: shop.collections.map(c => ({
            Date: c.collectedAt.toLocaleDateString(),
            Time: c.collectedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            Amount: c.amount,
            'Payment Mode': c.paymentMode,
            'Collected By': c.employee.name || 'Unknown',
            'Reference/Remarks': c.remarks || '-'
        }))
    }
}

export async function getAllShopsExportData() {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { error: 'Unauthorized' }

    const shops = await prisma.shop.findMany({
        where: { ownerId: session.user.id },
        include: {
            _count: {
                select: { collections: true }
            }
        },
        orderBy: { name: 'asc' }
    })

    return shops.map(shop => ({
        Name: shop.name,
        Address: shop.address || '-',
        Mobile: shop.mobile || '-',
        'Due Amount': shop.dueAmount,
        'Total Collections': shop._count.collections,
        Latitude: shop.latitude,
        Longitude: shop.longitude,
        'Created At': shop.createdAt.toISOString().split('T')[0]
    }))
}

export async function bulkUpdateShopDuesAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { success: false, error: 'Unauthorized', updatedCount: 0, missingShops: [] as string[] }

    const file = formData.get('file') as File
    if (!file) {
        return { success: false, error: 'No file uploaded', updatedCount: 0, missingShops: [] as string[] }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes) // Use Buffer.from instead of new Buffer
        const workbook = XLSX.read(buffer, { type: 'buffer' })

        if (workbook.SheetNames.length === 0) return { success: false, error: 'Empty Excel file', updatedCount: 0, missingShops: [] as string[] }
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data: any[] = XLSX.utils.sheet_to_json(worksheet)

        let updatedCount = 0
        const missingShops: string[] = []

        for (const row of data) {
            // Flexible column matching
            const name = row['Shop Name'] || row['Name'] || row['shop name'] || row['name']

            // Handle various Due Amount column names and types
            let dueRaw = row['Due Amount'] || row['Due'] || row['due amount'] || row['due']

            if (!name) continue

            const dueAmount = parseFloat(dueRaw)
            if (isNaN(dueAmount)) continue

            // Find shop by name AND ownerId
            const shop = await prisma.shop.findFirst({
                where: {
                    ownerId: session.user.id,
                    name: {
                        equals: String(name),
                        mode: 'insensitive'
                    }
                }
            })

            if (shop) {
                await prisma.shop.update({
                    where: { id: shop.id },
                    data: { dueAmount }
                })
                updatedCount++
            } else {
                missingShops.push(String(name))
            }
        }

        revalidatePath('/owner/shops')
        return {
            success: true,
            updatedCount,
            missingShops,
            error: undefined
        }

    } catch (e) {
        console.error(e)
        return { success: false, error: 'Failed to process file', updatedCount: 0, missingShops: [] as string[] }
    }
}
