import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function EmployeeHome() {
    const session = await getSession()
    if (!session) return null

    // Determine current day
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const today = days[new Date().getDay()]

    // Find routes assigned to this employee's OWNER (Currently simple logic: Show ALL routes for the owner matching today? 
    // Requirement said "owner can schedule route". Usually implies assigning a route to an employee.
    // My schema linked Route to Owner, but not directly to Employee.
    // Assumption: Employee sees routes created by their Owner for Today. 
    // Better: Employee should probably be assigned a route. 
    // For Prototype: Employee sees ALL routes for their Owner for TODAY.

    const routes = await prisma.route.findMany({
        where: {
            ownerId: session.user.ownerId!,
            dayOfWeek: today
        },
        include: {
            stops: {
                include: { shop: true },
                orderBy: { order: 'asc' }
            }
        }
    })

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800">Today: {today}</h2>
                <p className="text-sm text-gray-500">{routes.length} Active Routes found</p>
            </div>

            {routes.map(route => (
                <div key={route.id} className="space-y-2">
                    <h3 className="font-semibold text-indigo-700">{route.name}</h3>
                    {route.stops.map((stop, idx) => (
                        <Link key={stop.id} href={`/employee/collect/${stop.shop.id}`}>
                            <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition">
                                <div>
                                    <div className="font-bold text-gray-900">{stop.shop.name}</div>
                                    <div className="text-xs text-gray-500">{stop.shop.address}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-red-600">Due: ₹{stop.shop.dueAmount}</div>
                                    <div className="text-xs text-indigo-600 mt-1">Collect &rarr;</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {route.stops.length === 0 && <p className="text-sm text-gray-400">No shops in this route.</p>}
                </div>
            ))}

            {routes.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No routes scheduled for today.
                </div>
            )}
        </div>
    )
}
