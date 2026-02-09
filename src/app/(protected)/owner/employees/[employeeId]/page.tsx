import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { EmployeeForm } from '../employee-form'
import { updateEmployeeAction, deleteEmployeeAction } from '../actions'
import { redirect } from 'next/navigation'
import { RouteAssignmentForm } from './route-assignment-form'
import { DutyHistoryList } from './duty-history-list'
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

    // Fetch Duty Logs (Handle DB Schema Mismatch Gracefully)
    let logs: any[] = []
    try {
        logs = await prisma.dutyLog.findMany({
            where: { employeeId: employee.id },
            orderBy: { timestamp: 'desc' },
            take: 50 // Limit to last 50
        })
    } catch (e) {
        console.error("Failed to fetch duty logs (Schema mismatch?):", e)
        // Keep logs empty if table doesn't exist
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Employee</h1>
                <a href="/owner/employees" className="text-gray-500 text-sm hover:underline">← Back to List</a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
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

                <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
                    <h2 className="text-lg font-medium mb-4 flex items-center justify-between">
                        Duty History
                        <span className="text-xs text-gray-500 font-normal">Last 50 events</span>
                    </h2>
                    <DutyHistoryList logs={logs} />
                </div>
            </div>
        </div>
    )
}
