import { prisma } from '@/lib/db'
import { CreateOwnerForm } from './create-owner-form'
import { getGlobalSettings } from '../settings/actions'

export default async function OwnersPage() {
    const settings = await getGlobalSettings()
    const owners = await prisma.user.findMany({
        where: { role: 'OWNER' },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    employees: true,
                    shops: true,
                }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Manage Owners</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add New Owner</h3>
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <CreateOwnerForm defaultDomain={settings.defaultDomain} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Existing Owners</h3>
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {owners.map((owner) => (
                                    <tr key={owner.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                                            <div className="text-sm text-gray-500">{owner.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {owner._count.employees} Employees<br />
                                            {owner._count.shops} Shops
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(owner.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href={`/admin/owners/${owner.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                        </td>
                                    </tr>
                                ))}
                                {owners.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No owners found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
