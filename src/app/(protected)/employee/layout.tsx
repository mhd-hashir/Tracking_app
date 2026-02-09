import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LocationTracker } from './location-tracker'
import { prisma } from '@/lib/db'

export default async function EmployeeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session || session.user.role !== 'EMPLOYEE') {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isOnDuty: true }
    })

    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <header className="bg-indigo-600 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="flex justify-between items-center">
                    <Link href="/employee" className="font-bold text-lg">My Route</Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-90">{session.user.name}</span>
                        <form action={async () => {
                            'use server'
                            const { logout } = await import('@/lib/auth')
                            await logout()
                            redirect('/login')
                        }}>
                            <button className="bg-indigo-700 px-2 py-1 rounded text-xs hover:bg-indigo-800 transition">Logout</button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 pb-20">
                {children}
            </main>
            <LocationTracker initialStatus={!!user?.isOnDuty} />
        </div>
    )
}
