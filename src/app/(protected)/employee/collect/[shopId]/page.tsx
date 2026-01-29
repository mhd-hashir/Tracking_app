import { prisma } from '@/lib/db'
import { CollectForm } from './collect-form'

export default async function CollectPage({ params }: { params: Promise<{ shopId: string }> }) {
    const { shopId } = await params
    const shop = await prisma.shop.findUnique({
        where: { id: shopId }
    })

    if (!shop) return <div>Shop not found</div>

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-900">{shop.name}</h2>
                <p className="text-gray-500 text-sm">{shop.address}</p>
                <div className="mt-4 p-3 bg-red-50 rounded border border-red-100">
                    <div className="text-xs text-red-600 uppercase font-semibold">Total Due Amount</div>
                    <div className="text-3xl font-bold text-red-700">₹{shop.dueAmount}</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="text-lg font-bold mb-4">Record Collection</h3>
                <CollectForm shopId={shop.id} dueAmount={shop.dueAmount} />
            </div>
        </div>
    )
}
