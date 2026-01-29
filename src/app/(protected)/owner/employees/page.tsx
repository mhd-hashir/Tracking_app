import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { AddEmployeeForm } from './add-employee-form'

export default async function EmployeesPage() {
    const session = await getSession()
    if (!session) return null

    const employees = await prisma.user.findMany({
        where: {
            role: 'EMPLOYEE',
            ownerId: session.user.id
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Manage Employees</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Add New Employee</h3>
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <AddEmployeeForm />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your Team</h3>
                    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {employees.length === 0 && (
                                <li className="p-4 text-center text-gray-500 text-sm">No employees added yet.</li>
                            )}
                            {employees.map((emp) => (
                                <li key={emp.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-gray-900">{emp.name}</div>
                                        <div className="text-sm text-gray-500">{emp.email}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Active
                                        </span>
                                        <a href={`/owner/employees/${emp.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
