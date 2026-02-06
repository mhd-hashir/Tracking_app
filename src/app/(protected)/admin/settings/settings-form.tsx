'use client'

import { useActionState } from "react"
import { updateGlobalDomain } from './actions'

interface SettingsFormProps {
    initialDomain: string
}

export function SettingsForm({ initialDomain }: SettingsFormProps) {
    const [state, formAction, isPending] = useActionState(updateGlobalDomain, null)

    return (
        <div className="bg-white p-6 rounded-lg shadow border md:w-1/2">
            <h3 className="text-lg font-medium mb-4">Global Configuration</h3>
            <form action={formAction} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Email Domain</label>
                    <p className="text-xs text-gray-500 mb-2">All new Owners and Employees will be forced to use this domain.</p>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                            @
                        </span>
                        <input
                            type="text"
                            name="domain"
                            defaultValue={initialDomain}
                            required
                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="fieldtrack.com"
                        />
                    </div>
                </div>

                {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}
                {state?.success && <div className="text-green-500 text-sm">Domain setting updated successfully!</div>}

                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                    {isPending ? 'Saving...' : 'Save Configuration'}
                </button>
            </form>
        </div>
    )
}
