'use client'

import { useActionState } from "react"
import { updateOwnerAction, deleteOwnerAction, masqueradeAsOwner } from '../actions'

interface EditOwnerFormProps {
    owner: {
        id: string
        name: string | null
        email: string
        ownedDomain: string | null
        planType: string
        subscriptionStatus: string
        subscriptionExpiry: Date | null
    }
}

export function EditOwnerForm({ owner }: EditOwnerFormProps) {
    const [updateState, updateAction, isUpdatePending] = useActionState(updateOwnerAction, null)

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Edit Owner Details</h3>
                    <form action={masqueradeAsOwner.bind(null, owner.id)}>
                        <button type="submit" className="text-sm bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded border border-green-200 transition">
                            Login as Owner
                        </button>
                    </form>
                </div>
                <form action={updateAction} className="space-y-4">
                    <input type="hidden" name="ownerId" value={owner.id} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                        <input name="name" defaultValue={owner.name || ''} type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input name="email" defaultValue={owner.email} type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Forced Custom Domain</label>
                        <p className="text-xs text-gray-500">Overrides global default for this owner's employees</p>
                        <input name="ownedDomain" defaultValue={owner.ownedDomain || ''} type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Leave empty to use global default" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password (Leave blank to keep current)</label>
                        <input name="password" type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plan Type</label>
                            <select name="planType" defaultValue={owner.planType} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-black bg-white">
                                <option value="FREE">Free</option>
                                <option value="PRO">Pro</option>
                                <option value="ENTERPRISE">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="subscriptionStatus" defaultValue={owner.subscriptionStatus} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-black bg-white">
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            name="subscriptionExpiry"
                            type="date"
                            defaultValue={owner.subscriptionExpiry ? new Date(owner.subscriptionExpiry).toISOString().split('T')[0] : ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>

                    {updateState?.error && <div className="text-red-500 text-sm">{updateState.error}</div>}
                    {updateState?.success && <div className="text-green-500 text-sm">Owner updated successfully!</div>}

                    <button
                        type="submit"
                        disabled={isUpdatePending}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {isUpdatePending ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">Deleting an owner will permanently delete all their shops, employees, and collections. This action cannot be undone.</p>

                <form action={async (formData) => { await deleteOwnerAction(formData) }} onSubmit={(e) => { if (!confirm('Are you absolutely sure? This will delete EVERYTHING related to this owner.')) e.preventDefault() }}>
                    <input type="hidden" name="ownerId" value={owner.id} />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-red-700 mb-1">Confirm with your Admin Password</label>
                        <input name="adminPassword" type="password" required className="block w-full max-w-xs rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border p-2" placeholder="Admin Password" />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Delete Owner
                    </button>
                </form>
            </div>
        </div>
    )
}
