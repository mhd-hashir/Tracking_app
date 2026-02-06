import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getGlobalSettings } from './actions'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/login')
    }

    const settings = await getGlobalSettings()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
            </div>

            <SettingsForm initialDomain={settings.defaultDomain} />
        </div>
    )
}
