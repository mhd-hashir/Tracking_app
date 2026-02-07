'use client'

import { useActionState, useTransition, useState, useEffect } from "react"
import { updateRouteAction, deleteRouteAction } from '../actions'
import { useRouter } from "next/navigation"

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export function EditRouteForm({ shops, route }: { shops: any[], route: any }) {
    const [state, formAction, isPending] = useActionState(updateRouteAction, null)
    const [isDeleting, startDelete] = useTransition()
    const router = useRouter()

    const [mode, setMode] = useState<'CUSTOM' | 'EVERY'>('CUSTOM')
    const [selectedDays, setSelectedDays] = useState<string[]>([])

    useEffect(() => {
        if (route.dayOfWeek) {
            const days = route.dayOfWeek.split(',')
            setSelectedDays(days)
            if (days.length === 7) {
                setMode('EVERY')
            } else {
                setMode('CUSTOM')
            }
        }
    }, [route])

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day))
        } else {
            setSelectedDays([...selectedDays, day])
        }
    }

    const handleModeChange = (newMode: 'CUSTOM' | 'EVERY') => {
        setMode(newMode)
        if (newMode === 'EVERY') {
            setSelectedDays([...DAYS])
        } else {
            // Keep existing selection or clear?
            // If switching frpom EVERY to CUSTOM, keep all selected or clear?
            // Usually useful to keep. But if I want to "custom"ize, I might want to start fresh or subtract.
            // Let's keep them selected so user can uncheck one.
            if (selectedDays.length === 0) setSelectedDays([]) // just init
            else setSelectedDays([...DAYS]) // Wait, if I switch to custom, I just want current selection.
        }
    }

    // Correction: On EVERY mode select, I just set selectedDays to all.
    // On Custom, I don't change anything, just allow validation.

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

    return (
        <div className="space-y-8">
            <form action={formAction} className="space-y-4">
                <input type="hidden" name="routeId" value={route.id} />

                <div>
                    <label className="block text-sm font-medium mb-1">Route Name</label>
                    <input
                        name="name"
                        defaultValue={route.name}
                        required
                        className="block w-full border rounded p-2"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium">Frequency</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="frequency_mode"
                                checked={mode === 'EVERY'}
                                onChange={() => {
                                    setMode('EVERY')
                                    setSelectedDays([...DAYS])
                                }}
                            />
                            <span className="text-sm">Every Day</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="frequency_mode"
                                checked={mode === 'CUSTOM'}
                                onChange={() => {
                                    setMode('CUSTOM')
                                    // Keep current selection
                                }}
                            />
                            <span className="text-sm">Custom / Specific Days</span>
                        </label>
                    </div>

                    {mode === 'EVERY' && DAYS.map(day => (
                        <input key={day} type="hidden" name="dayOfWeek" value={day} />
                    ))}

                    {mode === 'CUSTOM' && (
                        <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-50 rounded border">
                            {DAYS.map(day => (
                                <label key={day} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="dayOfWeek"
                                        value={day}
                                        checked={selectedDays.includes(day)}
                                        onChange={() => toggleDay(day)}
                                    />
                                    <span className="text-sm capitalize">{day.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Select Shops for this Route</label>
                    <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-2 bg-white">
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
