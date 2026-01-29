'use client'

import { useActionState } from "react"
import { createOwnerAction } from './actions'

export function CreateOwnerForm() {
    const [state, formAction, isPending] = useActionState(createOwnerAction, null)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
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
