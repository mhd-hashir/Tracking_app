import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session || session.user.role !== 'OWNER') {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold text-indigo-600">FieldTrack</h1>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                            <Link href="/owner" className="hover:text-indigo-600 transition">Dashboard</Link>
                            <Link href="/owner/employees" className="hover:text-indigo-600 transition">Employees</Link>
                            <Link href="/owner/shops" className="hover:text-indigo-600 transition">Shops</Link>
                            <Link href="/owner/data" className="hover:text-indigo-600 transition">Data</Link>
                            <Link href="/owner/routes" className="hover:text-indigo-600 transition">Routes</Link>
                            <Link href="/owner/live" className="text-yellow-300 font-semibold hover:text-yellow-100">🔴 Live Map</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{session.user.name}</span>
                        <form action={async () => {
                            'use server'
                            const { logout } = await import('@/lib/auth')
                            await logout()
                            redirect('/login')
                        }}>
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex-1 bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
