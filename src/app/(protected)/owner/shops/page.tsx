import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ImportShopsButton } from './import-button'
import { ExportButton } from './export-button'
import { AddShopForm } from './add-shop-form'
import Link from 'next/link'

export default async function ShopsPage() {
    const session = await getSession()
    if (!session) return null

    const shops = await prisma.shop.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Manage Shops</h2>
                <div className="flex gap-2">
                    <ImportShopsButton />
                    <Link href="/owner/shops/bulk-update" className="bg-white border rounded px-3 py-1.5 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                        📊 Bulk Update
                    </Link>
                    <ExportButton mode="ALL" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Simple Add Form */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add Single Shop</h3>
                    <AddShopForm />
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Shop List</h3>
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shops.map((shop: any) => (
                                    <tr key={shop.id}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{shop.name}</div>
                                            <div className="text-sm text-gray-500">{shop.address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {shop.mobile ? (
                                                <a href={`tel:${shop.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                    📞 {shop.mobile}
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-red-600">₹{shop.dueAmount}</td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <a href={`/owner/shops/${shop.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">
                                                Edit
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
