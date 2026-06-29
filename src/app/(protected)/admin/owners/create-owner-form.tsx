'use client'

import { useActionState } from "react"
import { createOwnerAction } from './actions'

interface CreateOwnerFormProps {
}

export function CreateOwnerForm() {
    const [state, formAction, isPending] = useActionState(createOwnerAction, null)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                    type="text"
                    name="mobile"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    placeholder="+1234567890"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Type</label>
                    <select name="planType" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-black bg-white">
                        <option value="FREE">Free</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="subscriptionStatus" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-black bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                <input name="subscriptionExpiry" type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>

            {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}
            {state?.success && <div className="text-green-500 text-sm">Owner created successfully!</div>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
                {isPending ? 'Creating...' : 'Create Owner'}
            </button>
        </form>
    )
}
