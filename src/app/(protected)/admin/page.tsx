import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
    const ownersCount = await prisma.user.count({ where: { role: 'OWNER' } })
    const activeOwnersCount = await prisma.user.count({ where: { role: 'OWNER', subscriptionStatus: 'ACTIVE' } })
    const employeesCount = await prisma.user.count({ where: { role: 'EMPLOYEE' } })
    const totalRevenue = await prisma.collection.aggregate({ _sum: { amount: true } })

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                        <h3 className="tracking-tight text-sm font-medium">Active Owners</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">{activeOwnersCount}</div>
                        <p className="text-xs text-muted-foreground text-green-600">Currently active</p>
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

                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-2xl font-bold">₹{(totalRevenue._sum.amount || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total platform collections</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
