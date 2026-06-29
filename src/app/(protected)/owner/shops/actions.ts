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

export async function importShopsAction(prevState: any, formData: FormData) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { success: false, error: 'Unauthorized', count: 0 }

    const file = formData.get('file') as File
    if (!file) {
        return { success: false, error: 'No file uploaded', count: 0 }
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes) // Use Buffer.from instead of new Buffer
        const workbook = XLSX.read(buffer, { type: 'buffer' })

        if (workbook.SheetNames.length === 0) return { success: false, error: 'Empty Excel file', count: 0 }
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data: any[] = XLSX.utils.sheet_to_json(worksheet)

        // 1. Fetch all existing shops for comparison (Optimized: 1 Query)
        // Fetch ALL fields needed for revert
        const existingShops = await prisma.shop.findMany({
            where: { ownerId: session.user.id }
        })

        // 2. Create Map for O(1) lookups
        const shopMap = new Map<string, any>()
        existingShops.forEach(shop => {
            if (shop.name) shopMap.set(shop.name.toLowerCase().trim(), shop)
        })

        const transactionOps: any[] = []
        const revertMeta: any[] = [] // { type: 'CREATE' | 'UPDATE', original: any }

        let createdCount = 0
        let updatedCount = 0

        for (const row of data) {
            // Flexible matching
            const nameRaw = row['Name'] || row['Shop Name'] || row['shop name'] || row['name']
            if (!nameRaw) continue
            const name = String(nameRaw).trim()
            const lowerName = name.toLowerCase()

            const addressRaw = row['Address'] || row['Location'] || row['address']
            const mobileRaw = row['Mobile'] || row['Phone'] || row['mobile']
            const dueRaw = row['Due Amount'] || row['Due'] || row['due amount'] || row['due']

            const existingShop = shopMap.get(lowerName)

            if (existingShop) {
                // Upsert Logic: Check what needs updating
                const updateData: any = {}

                if (addressRaw !== undefined) updateData.address = String(addressRaw)
                if (mobileRaw !== undefined) updateData.mobile = String(mobileRaw)

                const hasDueKey = row['Due Amount'] !== undefined || row['Due'] !== undefined || row['due amount'] !== undefined || row['due'] !== undefined
                if (hasDueKey) {
                    const due = parseFloat(dueRaw)
                    if (!isNaN(due)) updateData.dueAmount = due
                }

                if (Object.keys(updateData).length > 0) {
                    transactionOps.push(
                        prisma.shop.update({
                            where: { id: existingShop.id },
                            data: updateData
                        })
                    )
                    // Store complete original state for revert flexibility
                    revertMeta.push({ type: 'UPDATE', original: existingShop })
                    updatedCount++
                }
            } else {
                // Create new
                transactionOps.push(
                    prisma.shop.create({
                        data: {
                            name: name, // Use original case
                            address: addressRaw ? String(addressRaw) : '',
                            mobile: mobileRaw ? String(mobileRaw) : null,
                            dueAmount: dueRaw ? (parseFloat(dueRaw) || 0) : 0,
                            ownerId: session.user.id
                        }
                    })
                )
                revertMeta.push({ type: 'CREATE' })
                createdCount++
            }
        }

        // 3. Execute all operations in a SINGLE transaction 
        let results: any[] = []
        if (transactionOps.length > 0) {
            results = await prisma.$transaction(transactionOps)
        }

        // 4. Build Revert Payload matching Results unique IDs
        const createdShopIds: string[] = []
        const originalShops: any[] = []

        results.forEach((result, index) => {
            const meta = revertMeta[index]
            if (meta.type === 'CREATE') {
                createdShopIds.push(result.id)
            } else if (meta.type === 'UPDATE') {
                originalShops.push(meta.original)
            }
        })

        // 5. Store Undo History
        let batchId: string | undefined = undefined
        if (createdShopIds.length > 0 || originalShops.length > 0) {
            const batch = await prisma.importBatch.create({
                data: {
                    ownerId: session.user.id,
                    createdCount,
                    updatedCount,
                    revertData: {
                        createdShopIds,
                        originalShops
                    }
                }
            })
            batchId = batch.id
        }

        revalidatePath('/owner/shops')
        return { success: true, count: createdCount + updatedCount, createdCount, updatedCount, batchId, error: undefined }

    } catch (e) {
        console.error(e)
        return { success: false, error: 'Failed to process file', count: 0 }
    }
}

export async function undoImportAction(batchId: string) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return { success: false, error: 'Unauthorized' }

    try {
        const batch = await prisma.importBatch.findUnique({
            where: { id: batchId }
        })

        if (!batch || batch.ownerId !== session.user.id) {
            return { success: false, error: 'Undo data not found or unauthorized' }
        }

        // Check 5-minute timer
        const now = new Date()
        const diff = now.getTime() - batch.createdAt.getTime()
        if (diff > 5 * 60 * 1000) {
            return { success: false, error: 'Undo period has expired (limited to 5 minutes)' }
        }

        const revertData = batch.revertData as any
        const createdIds: string[] = revertData.createdShopIds || []
        const originalShops: any[] = revertData.originalShops || []

        const undoOps: any[] = []

        // 1. Delete created shops
        if (createdIds.length > 0) {
            undoOps.push(
                prisma.shop.deleteMany({
                    where: { id: { in: createdIds } }
                })
            )
        }

        // 2. Revert updated shops
        for (const shop of originalShops) {
            // Restore all basic fields present in the snapshot
            const dataToRestore: any = {}
            if (shop.name !== undefined) dataToRestore.name = shop.name
            if (shop.address !== undefined) dataToRestore.address = shop.address
            if (shop.mobile !== undefined) dataToRestore.mobile = shop.mobile
            if (shop.dueAmount !== undefined) dataToRestore.dueAmount = shop.dueAmount
            if (shop.latitude !== undefined) dataToRestore.latitude = shop.latitude
            if (shop.longitude !== undefined) dataToRestore.longitude = shop.longitude
            if (shop.geofenceRadius !== undefined) dataToRestore.geofenceRadius = shop.geofenceRadius

            undoOps.push(
                prisma.shop.update({
                    where: { id: shop.id },
                    data: dataToRestore
                })
            )
        }

        // 3. Execute Undo
        await prisma.$transaction(undoOps)

        // 4. Clean up batch history
        await prisma.importBatch.delete({ where: { id: batch.id } })

        revalidatePath('/owner/shops')
        return { success: true }

    } catch (e) {
        console.error(e)
        return { success: false, error: 'Failed to undo changes' }
    }
}

export async function extractCoordinatesAction(urlInput: string) {
    if (!urlInput || !urlInput.startsWith('http')) {
        return { error: 'Invalid URL' }
    }

    try {
        const response = await fetch(urlInput, {
            redirect: 'follow',
            method: 'GET',
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

export async function dueUpdateShopsAction(prevState: any, formData: FormData) {
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

        // 1. Fetch shops with due amount (Optimized)
        const existingShops = await prisma.shop.findMany({
            where: { ownerId: session.user.id }
        })

        // 2. Map
        const shopMap = new Map<string, any>()
        existingShops.forEach(shop => {
            if (shop.name) shopMap.set(shop.name.toLowerCase().trim(), shop)
        })

        const transactionOps: any[] = []
        const revertMeta: any[] = []
        let updatedCount = 0
        const missingShops: string[] = []

        for (const row of data) {
            // Flexible column matching
            const nameRaw = row['Shop Name'] || row['Name'] || row['shop name'] || row['name']
            if (!nameRaw) continue
            const name = String(nameRaw).trim()
            const lowerName = name.toLowerCase()

            let dueRaw = row['Due Amount'] || row['Due'] || row['due amount'] || row['due']
            if (dueRaw === undefined) continue

            const dueAmount = parseFloat(dueRaw)
            if (isNaN(dueAmount)) continue

            const shop = shopMap.get(lowerName)

            if (shop) {
                transactionOps.push(
                    prisma.shop.update({
                        where: { id: shop.id },
                        data: { dueAmount }
                    })
                )
                revertMeta.push({ type: 'UPDATE', original: shop })
                updatedCount++
            } else {
                missingShops.push(name)
            }
        }

        let batchId: string | undefined = undefined

        // 3. Batch Execute
        if (transactionOps.length > 0) {
            await prisma.$transaction(transactionOps)

            // 4. Save Undo
            const batch = await prisma.importBatch.create({
                data: {
                    ownerId: session.user.id,
                    createdCount: 0,
                    updatedCount: updatedCount,
                    revertData: {
                        createdShopIds: [],
                        originalShops: revertMeta.map(m => m.original)
                    }
                }
            })
            batchId = batch.id
        }

        revalidatePath('/owner/shops')
        return {
            success: true,
            updatedCount,
            missingShops,
            batchId,
            error: undefined
        }

    } catch (e) {
        console.error(e)
        return { success: false, error: 'Failed to process file', updatedCount: 0, missingShops: [] as string[] }
    }
}
