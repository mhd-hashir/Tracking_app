import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/login')
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border md:w-1/2">
                <p className="text-gray-500">No global settings available at this time.</p>
            </div>
        </div>
    )
}
