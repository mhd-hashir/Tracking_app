import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { CreateRouteForm } from './create-route-form'

export default async function RoutesPage() {
    const session = await getSession()
    if (!session) return null

    const routes = await prisma.route.findMany({
        where: { ownerId: session.user.id },
        include: {
            _count: { select: { stops: true } }
        }
    })

    // Get shops to assign
    const shops = await prisma.shop.findMany({
        where: { ownerId: session.user.id }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Manage Routes</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Create New Route</h3>
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <CreateRouteForm shops={shops} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Active Routes</h3>
                    <div className="grid gap-4">
                        {routes.map(route => (
                            <div key={route.id} className="p-4 border rounded bg-white shadow-sm">
                                <div className="font-bold">{route.name}</div>
                                <div className="text-sm text-gray-500">{route.dayOfWeek}</div>
                                <div className="mt-2 text-sm">{route._count.stops} Shops assigned</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
