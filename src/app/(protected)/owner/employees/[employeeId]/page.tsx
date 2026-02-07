import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { EmployeeForm } from '../employee-form'
import { updateEmployeeAction, deleteEmployeeAction } from '../actions'
import { redirect } from 'next/navigation'
import { RouteAssignmentForm } from './route-assignment-form'

import { getGlobalSettings } from '../../../admin/settings/actions'

export default async function EditEmployeePage({ params }: { params: Promise<{ employeeId: string }> }) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return <div>Unauthorized</div>

    const settings = await getGlobalSettings()
    const { employeeId } = await params

    const employee = await prisma.user.findFirst({
        where: {
            id: employeeId,
            ownerId: session.user.id
        }
    })

    if (!employee) {
        return <div>Employee not found</div>
    }

    const initialData = {
        id: employee.id,
        name: employee.name || '',
        email: employee.email
    }

    const owner = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    const displayDomain = owner?.ownedDomain || settings.defaultDomain

    // Fetch Routes
    const allRoutes = await prisma.route.findMany({
        where: { ownerId: session.user.id },
        orderBy: { name: 'asc' }
    })

    const assignedRoutes = await prisma.route.findMany({
        where: { assignedToId: employee.id }
    })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Employee</h1>
                <a href="/owner/employees" className="text-gray-500 text-sm hover:underline">← Back to List</a>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <EmployeeForm
                    action={updateEmployeeAction}
                    initialData={initialData}
                    submitLabel="Save Changes"
                    deleteAction={deleteEmployeeAction}
                    defaultDomain={displayDomain}
                />
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-lg font-medium mb-4">Route Schedule</h2>
                <RouteAssignmentForm
                    employeeId={employee.id}
                    allRoutes={allRoutes}
                    assignedRoutes={assignedRoutes}
                />
            </div>
        </div>
    )
}
