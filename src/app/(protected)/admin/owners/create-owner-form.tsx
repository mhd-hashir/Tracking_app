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
                <div className="flex -space-x-px">
                    <input
                        type="text"
                        name="username"
                        required
                        className="block w-1/2 min-w-0 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-right pr-1"
                        placeholder="username"
                    />
                    <span className="inline-flex items-center px-1 text-gray-500 border border-y-0 border-gray-300 bg-gray-50">@</span>
                    <input
                        type="text"
                        name="domain"
                        required
                        defaultValue={defaultDomain}
                        className="block w-1/2 min-w-0 rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 pl-1"
                        placeholder="domain.com"
                    />
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
