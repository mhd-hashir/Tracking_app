import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export default async function OwnerDashboard() {
    const session = await getSession()
    if (!session) return null

    const userId = session.user.id

    // Get stats for logged in owner
    const shopsCount = await prisma.shop.count({ where: { ownerId: userId } })
    const employeesCount = await prisma.user.count({ where: { ownerId: userId, role: 'EMPLOYEE' } })
    const routesCount = await prisma.route.count({ where: { ownerId: userId } })

    // Today's Metrics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayCollections = await prisma.collection.findMany({
        where: {
            shop: { ownerId: userId },
            collectedAt: {
                gte: today,
                lt: tomorrow
            }
        },
        select: {
            amount: true,
            shopId: true
        }
    })

    const totalCollectedToday = todayCollections.reduce((sum, c) => sum + c.amount, 0)
    const uniqueShopsVisited = new Set(todayCollections.map(c => c.shopId)).size

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Collected Today</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-3xl font-bold text-green-600">₹{totalCollectedToday.toLocaleString()}</div>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Shops Visited Today</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-3xl font-bold text-blue-600">{uniqueShopsVisited}</div>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Total Shops</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-3xl font-bold text-gray-900">{shopsCount}</div>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Active Employees</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-3xl font-bold text-gray-900">{employeesCount}</div>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex flex-col space-y-1.5">
                        <h3 className="tracking-tight text-sm font-medium text-gray-500">Routes Created</h3>
                    </div>
                    <div className="p-0 pt-4">
                        <div className="text-3xl font-bold text-gray-900">{routesCount}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
