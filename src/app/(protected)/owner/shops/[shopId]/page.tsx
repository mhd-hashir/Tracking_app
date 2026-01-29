import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ShopForm } from '../shop-form'
import { updateShopAction, deleteShopAction, extractCoordinatesAction } from '../actions'
import { redirect } from 'next/navigation'

import { ExportButton } from '../export-button'

export default async function EditShopPage({ params }: { params: Promise<{ shopId: string }> }) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return <div>Unauthorized</div>

    const { shopId } = await params

    const shop = await prisma.shop.findUnique({
        where: { id: shopId }
    })

    if (!shop || shop.ownerId !== session.user.id) {
        return <div>Shop not found or access denied</div>
    }

    // Convert Prisma object to ShopForm props structure (handling nulls)
    const initialData = {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        dueAmount: shop.dueAmount,
        mobile: shop.mobile,
        latitude: shop.latitude,
        longitude: shop.longitude,
        geofenceRadius: shop.geofenceRadius
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Edit Shop</h1>
                    <ExportButton mode="SINGLE" shopId={shopId} />
                </div>
                <a href="/owner/shops" className="text-gray-500 text-sm hover:underline">← Back to List</a>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <ShopForm
                    action={updateShopAction}
                    initialData={initialData}
                    submitLabel="Save Changes"
                    deleteAction={deleteShopAction}
                    extractAction={extractCoordinatesAction}
                />
            </div>
        </div>
    )
}
