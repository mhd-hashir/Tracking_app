import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { EditEmployeeAdminForm } from './edit-employee-admin-form'

interface PageProps {
    params: Promise<{
        ownerId: string
        employeeId: string
    }>
}

export default async function AdminEditEmployeePage({ params }: PageProps) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') redirect('/login')

    const { ownerId, employeeId } = await params

    const employee = await prisma.user.findUnique({
        where: {
            id: employeeId,
            role: 'EMPLOYEE',
            ownerId: ownerId // Ensure employee belongs to this owner
        }
    })

    if (!employee) notFound()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Manage Employee: {employee.name}</h2>
                <a href={`/admin/owners/${ownerId}`} className="text-sm text-gray-500 hover:text-gray-900">← Back to Owner</a>
            </div>

            <EditEmployeeAdminForm employee={employee} />
        </div>
    )
}
