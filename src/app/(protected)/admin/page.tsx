import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
    const ownersCount = await prisma.user.count({ where: { role: 'OWNER' } })
    const employeesCount = await prisma.user.count({ where: { role: 'EMPLOYEE' } })

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium">Total Owners</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">{ownersCount}</div>
                        <p className="text-xs text-muted-foreground">+ Active subscriptions</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium">Total Employees</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">{employeesCount}</div>
                        <p className="text-xs text-muted-foreground">+ Across all shops</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
