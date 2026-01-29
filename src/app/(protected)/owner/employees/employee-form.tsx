'use client'

import { useActionState } from "react"

interface EmployeeFormProps {
    action: (prevState: any, formData: FormData) => Promise<any>
    initialData?: {
        id?: string
        name: string
        email: string
    }
    submitLabel: string
    deleteAction?: (formData: FormData) => Promise<any>
}

export function EmployeeForm({ action, initialData, submitLabel, deleteAction }: EmployeeFormProps) {
    const [state, formAction, isPending] = useActionState(action, null)

    return (
        <div className="space-y-6">
            <form action={formAction} className="space-y-4">
                {initialData?.id && <input type="hidden" name="employeeId" value={initialData.id} />}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={initialData?.name}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        required
                        defaultValue={initialData?.email}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Password {initialData ? '(Leave blank to keep current)' : ''}
                    </label>
                    <input
                        name="password"
                        type="password"
                        required={!initialData}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                </div>

                {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}
                {state?.success && <div className="text-green-500 text-sm">Saved successfully!</div>}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                >
                    {isPending ? 'Saving...' : submitLabel}
                </button>
            </form>

            {initialData?.id && deleteAction && (
                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>Once you delete an employee, there is no going back. Please be certain.</p>
                    </div>
                    <form action={async (formData) => {
                        if (confirm("Are you sure you want to delete this employee?")) {
                            await deleteAction(formData)
                        }
                    }}>
                        <input type="hidden" name="employeeId" value={initialData.id} />
                        <button
                            type="submit"
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 w-full"
                        >
                            Delete Employee
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}
