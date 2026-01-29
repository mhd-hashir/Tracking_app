import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold">FieldTrack Admin</h1>
                    <nav className="flex gap-4 text-sm font-medium text-gray-300">
                        <a href="/admin" className="hover:text-white transition">Dashboard</a>
                        <a href="/admin/owners" className="hover:text-white transition">Manage Owners</a>
                    </nav>
                </div>
                <div className="flex gap-4">
                    <span>{session.user.email}</span>
                    <form action={async () => {
                        'use server'
                        const { logout } = await import('@/lib/auth')
                        await logout()
                        redirect('/login')
                    }}>
                        <button className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
                    </form>
                </div>
            </header>
            <main className="flex-1 p-6 bg-slate-50">
                {children}
            </main>
        </div>
    )
}
