'use client'

import { useActionState, useTransition, useEffect } from "react"
import { updateRouteAction, deleteRouteAction } from '../actions'
import { useRouter } from "next/navigation"

export function EditRouteForm({ shops, route }: { shops: any[], route: any }) {
    const [state, formAction, isPending] = useActionState(updateRouteAction, null)
    const [isDeleting, startDelete] = useTransition()
    const router = useRouter()

    const handleDelete = async (formData: FormData) => {
        const confirmed = window.confirm("Are you sure you want to delete this route? This cannot be undone.")
        if (!confirmed) return

        startDelete(async () => {
            const result = await deleteRouteAction(formData)
            if (result?.success) {
                router.push('/owner/routes')
            } else {
                alert('Failed to delete route')
            }
        })
    }

    // Redirect if update has specific logic? No, just show success.
    // If update success, maybe revalidate happens automatically.

    return (
        <div className="space-y-8">
            <form action={formAction} className="space-y-4">
                <input type="hidden" name="routeId" value={route.id} />

                <div>
                    <label className="block text-sm font-medium">Route Name</label>
                    <input
                        name="name"
                        defaultValue={route.name}
                        required
                        className="block w-full border rounded p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Day of Week</label>
                    <select
                        name="dayOfWeek"
                        defaultValue={route.dayOfWeek}
                        className="block w-full border rounded p-2"
                    >
                        <option value="MONDAY">Monday</option>
                        <option value="TUESDAY">Tuesday</option>
                        <option value="WEDNESDAY">Wednesday</option>
                        <option value="THURSDAY">Thursday</option>
                        <option value="FRIDAY">Friday</option>
                        <option value="SATURDAY">Saturday</option>
                        <option value="SUNDAY">Sunday</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Select Shops for this Route</label>
                    <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2">
                        {shops.map(shop => {
                            const isAssigned = route.stops.some((s: any) => s.shopId === shop.id)
                            return (
                                <div key={shop.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="shopIds"
                                        value={shop.id}
                                        id={`shop-${shop.id}`}
                                        defaultChecked={isAssigned}
                                    />
                                    <label htmlFor={`shop-${shop.id}`} className="text-sm cursor-pointer select-none">
                                        {shop.name} - <span className="text-gray-500">{shop.address || 'No address'}</span>
                                    </label>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isPending ? 'Updating...' : 'Update Route'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/owner/routes')}
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>

                {state?.success && (
                    <div className="p-2 bg-green-50 text-green-700 rounded text-sm">
                        Route updated successfully!
                    </div>
                )}
                {state?.error && (
                    <div className="p-2 bg-red-50 text-red-700 rounded text-sm">
                        {state.error}
                    </div>
                )}
            </form>

            <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">Danger Zone</h3>
                <form action={handleDelete}>
                    <input type="hidden" name="routeId" value={route.id} />
                    <button
                        type="submit"
                        disabled={isDeleting}
                        className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded text-sm hover:bg-red-100 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Route'}
                    </button>
                </form>
            </div>
        </div>
    )
}
