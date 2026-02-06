'use client'

import { useActionState } from "react"
import { updateOwnerAction, deleteOwnerAction } from '../actions'

interface EditOwnerFormProps {
    owner: {
        id: string
        name: string | null
        email: string
    }
}

export function EditOwnerForm({ owner }: EditOwnerFormProps) {
    const [updateState, updateAction, isUpdatePending] = useActionState(updateOwnerAction, null)

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium mb-4">Edit Owner Details</h3>
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
                        <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                        <input name="password" type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
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
