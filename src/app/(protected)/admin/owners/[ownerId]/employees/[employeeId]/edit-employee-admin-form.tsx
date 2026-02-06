'use client'

import { useActionState } from "react"
import { updateEmployeeByAdminAction, deleteEmployeeByAdminAction } from '../../../actions'
import { redirect } from 'next/navigation'

interface EditEmployeeAdminFormProps {
    employee: {
        id: string
        name: string | null
        email: string
    }
}

export function EditEmployeeAdminForm({ employee }: EditEmployeeAdminFormProps) {
    const [updateState, updateAction, isUpdatePending] = useActionState(updateEmployeeByAdminAction, null)

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-medium mb-4">Edit Employee Details</h3>
                <form action={updateAction} className="space-y-4">
                    <input type="hidden" name="employeeId" value={employee.id} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input name="name" defaultValue={employee.name || ''} type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input name="email" defaultValue={employee.email} type="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                        <input name="password" type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
                    </div>

                    {updateState?.error && <div className="text-red-500 text-sm">{updateState.error}</div>}
                    {updateState?.success && <div className="text-green-500 text-sm">Employee updated successfully!</div>}

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
                <p className="text-sm text-red-600 mb-4">Deleting this employee will remove them permanently.</p>

                <form action={async (formData) => {
                    if (confirm('Are you sure you want to delete this employee?')) {
                        const res = await deleteEmployeeByAdminAction(formData)
                        if (res?.success) {
                            // Since we are deep in the directory structure, navigating back in JS or action requires care.
                            // The server action only returned {success: true}, it didn't redirect.
                            // We can rely on browser navigation or reload, but cleaner to have checking logic.
                            // However, strictly speaking, this form is client side.
                            window.location.href = '../..' // Go back to Owner page
                        } else {
                            alert('Failed to delete')
                        }
                    }
                }}>
                    <input type="hidden" name="employeeId" value={employee.id} />
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Delete Employee
                    </button>
                </form>
            </div>
        </div>
    )
}
