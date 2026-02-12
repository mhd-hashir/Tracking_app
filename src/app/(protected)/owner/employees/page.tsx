import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { AddEmployeeForm } from './add-employee-form'
import { getGlobalSettings } from '../../admin/settings/actions'
import { AllDutyLogs } from './all-duty-logs'
import { DutyLogFilters } from './duty-log-filters'

export const dynamic = 'force-dynamic'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EmployeesPage({ searchParams }: Props) {
    const session = await getSession()
    if (!session) return null

    const settings = await getGlobalSettings()
    const params = await searchParams

    // Fetch Employees
    const employees = await prisma.user.findMany({
        where: {
            role: 'EMPLOYEE',
            ownerId: session.user.id
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            isOnDuty: true,
        }
    })

    const owner = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    const displayDomain = owner?.ownedDomain || settings.defaultDomain

    // Build Filters
    const employeeIdFilter = typeof params.employeeId === 'string' ? params.employeeId : undefined
    const statusFilter = typeof params.status === 'string' ? params.status : undefined
    const fromDate = typeof params.from === 'string' ? params.from : undefined
    const toDate = typeof params.to === 'string' ? params.to : undefined

    // Fetch Unique Employees from Logs for Filter
    let filterOptions: Array<{ id: string, name: string | null, email: string | null }> = []
    try {
        const uniqueLogEmployees = await prisma.dutyLog.findMany({
            where: { employee: { ownerId: session.user.id } },
            distinct: ['employeeId'],
            select: {
                employee: {
                    select: { id: true, name: true, email: true }
                }
            }
        })
        filterOptions = uniqueLogEmployees.map(log => log.employee)
    } catch (e) {
        // Fallback to all employees if logs query fails
        filterOptions = employees.map(e => ({ id: e.id, name: e.name, email: e.email }))
    }

    const where: any = {
        employee: { ownerId: session.user.id } // Base filter: only my employees
    }

    if (employeeIdFilter) {
        where.employeeId = employeeIdFilter
    }

    if (statusFilter) {
        where.status = statusFilter
    }

    if (fromDate || toDate) {
        where.timestamp = {}

        if (fromDate) {
            const start = new Date(fromDate)
            if (!isNaN(start.getTime())) {
                where.timestamp.gte = start
            }
        }

        if (toDate) {
            const end = new Date(toDate)
            if (!isNaN(end.getTime())) {
                // Include the full "To" day by going to start of next day
                end.setDate(end.getDate() + 1)
                where.timestamp.lt = end
            }
        }
    }

    // Fetch Duty Logs (Safely)
    let logs: any[] = []
    try {
        logs = await prisma.dutyLog.findMany({
            where,
            include: { employee: { select: { name: true, email: true } } },
            orderBy: { timestamp: 'desc' },
            take: 200 // Increased limit for filtered view
        })
    } catch (e) {
        console.warn("DutyLog table missing or error:", e)
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Manage Employees</h2>
                    <p className="text-sm text-gray-500 mt-1">Add, edit, and track your team status.</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500">Total Employees</span>
                    <div className="text-2xl font-bold text-indigo-600">{employees.length}</div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        Add New Employee
                    </h3>
                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                        <AddEmployeeForm defaultDomain={displayDomain} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Your Team
                    </h3>
                    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                        {employees.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No employees added yet.</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {employees.map((emp) => (
                                    <li key={emp.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                                        <div>
                                            <div className="font-medium text-gray-900">{emp.name || 'Unnamed'}</div>
                                            <div className="text-xs text-gray-500">{emp.email}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {emp.isOnDuty ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 animate-pulse">
                                                    ● On Duty
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                    Off Duty
                                                </span>
                                            )}
                                            <a href={`/owner/employees/${emp.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium hover:underline">Edit</a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                    Recent Activity Logs
                </h3>

                <DutyLogFilters employees={filterOptions} />

                <AllDutyLogs logs={logs} />
                {logs.length === 200 && (
                    <p className="text-xs text-center text-gray-400 mt-2">Showing last 200 results. Refine filters to see more.</p>
                )}
            </div>
        </div>
    )
}
