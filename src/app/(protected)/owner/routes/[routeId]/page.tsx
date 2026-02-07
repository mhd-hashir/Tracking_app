import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { EditRouteForm } from './edit-route-form'
import Link from 'next/link'

export default async function EditRoutePage({ params }: { params: Promise<{ routeId: string }> }) {
    const session = await getSession()
    if (!session || session.user.role !== 'OWNER') return redirect('/login')

    const { routeId } = await params

    const route = await prisma.route.findUnique({
        where: { id: routeId, ownerId: session.user.id },
        include: { stops: true }
    })

    if (!route) return notFound()

    const shops = await prisma.shop.findMany({
        where: { ownerId: session.user.id },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Route</h1>
                <Link href="/owner/routes" className="text-gray-500 text-sm hover:underline">
                    ← Back to Routes
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <EditRouteForm route={route} shops={shops} />
            </div>
        </div>
    )
}
