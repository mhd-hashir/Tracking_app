import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { EditOwnerForm } from './edit-owner-form'

interface PageProps {
    params: Promise<{
        ownerId: string
    }>
}

export default async function EditOwnerPage({ params }: PageProps) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') redirect('/login')

    const { ownerId } = await params

    const owner = await prisma.user.findUnique({
        where: { id: ownerId, role: 'OWNER' },
        include: {
            employees: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!owner) notFound()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Manage Owner: {owner.name}</h2>
                <a href="/admin/owners" className="text-sm text-gray-500 hover:text-gray-900">← Back to Owners</a>
            </div>

            <EditOwnerForm owner={owner} />

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Managed Employees ({owner.employees.length})</h3>
                </div>

                <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {owner.employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(emp.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href={`/admin/owners/${ownerId}/employees/${emp.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                            ))}
                            {owner.employees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No employees found for this owner.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
