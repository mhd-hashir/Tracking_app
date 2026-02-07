import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OwnerNav } from './nav'

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
                        <Link href="/owner" className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-indigo-600">FieldTrack</h1>
                        </Link>
                        <OwnerNav />
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
