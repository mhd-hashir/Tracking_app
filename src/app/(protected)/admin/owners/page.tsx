import { prisma } from '@/lib/db'
import { CreateOwnerForm } from './create-owner-form'

export default async function OwnersPage() {
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
                        <CreateOwnerForm />
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
                                    </tr>
                                ))}
                                {owners.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No owners found.</td>
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
