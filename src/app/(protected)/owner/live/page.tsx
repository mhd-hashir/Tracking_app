import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import MapWrapper from './map-wrapper'

export default async function LiveDashboardPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return <div>Unauthorized</div>

    const employees = await prisma.user.findMany({
        where: {
            ownerId: session.user.id,
            role: 'EMPLOYEE'
        },
        select: {
            id: true,
            name: true,
            email: true,
            lastLatitude: true,
            lastLongitude: true,
            lastLocationUpdate: true,
            isOnDuty: true
        }
    })

    // Fetch Collection History (Today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch Path History
    const historyData = await prisma.locationHistory.findMany({
        where: {
            timestamp: { gte: today },
            employee: { ownerId: session.user.id }
        },
        orderBy: { timestamp: 'asc' }
    })

    // Group paths by employee
    const historyPaths: { [key: string]: [number, number][] } = {}
    historyData.forEach(h => {
        if (!historyPaths[h.employeeId]) historyPaths[h.employeeId] = []
        historyPaths[h.employeeId].push([h.latitude, h.longitude])
    })

    const collectionPoints = await prisma.collection.findMany({
        where: {
            shop: { ownerId: session.user.id },
            collectedAt: { gte: today }
        },
        include: { shop: true, employee: true }
    })

    const recentCollections = await prisma.collection.findMany({
        where: { shop: { ownerId: session.user.id } },
        orderBy: { collectedAt: 'desc' },
        take: 5,
        include: { shop: true, employee: true }
    })

    return (
        <div className="h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col space-y-4">
                <h1 className="text-2xl font-bold">Live Fleet Tracking</h1>
                <div className="flex-1 border rounded-lg overflow-hidden shadow-sm min-h-[400px]">
                    <MapWrapper
                        employees={employees}
                        historyPaths={historyPaths}
                        collectionPoints={collectionPoints}
                    />
                </div>
                <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                    Found {employees.length} employees. {employees.filter(e => e.lastLatitude).length} are sharing location.
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm h-full overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Recent Collections</h2>
                <div className="space-y-4">
                    {recentCollections.map(c => (
                        <div key={c.id} className="border-b pb-2 last:border-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">{c.shop.name}</div>
                                    <div className="text-xs text-gray-500">by {c.employee.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">₹{c.amount}</div>
                                    <div className="text-xs text-gray-400">{new Date(c.collectedAt).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {recentCollections.length === 0 && <div className="text-gray-500 text-center">No collections today.</div>}
                </div>
            </div>
        </div>
    )
}
