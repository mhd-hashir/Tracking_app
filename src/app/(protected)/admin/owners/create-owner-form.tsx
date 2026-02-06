'use client'

import { useActionState } from "react"
import { createOwnerAction } from './actions'

interface CreateOwnerFormProps {
    defaultDomain: string
}

export function CreateOwnerForm({ defaultDomain }: CreateOwnerFormProps) {
    const [state, formAction, isPending] = useActionState(createOwnerAction, null)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                        type="text"
                        name="username"
                        required
                        className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        placeholder="john.doe"
                    />
                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                        @{defaultDomain}
                    </span>
                </div>
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
