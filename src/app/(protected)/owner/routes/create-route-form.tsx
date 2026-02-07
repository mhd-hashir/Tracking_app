'use client'

import { useActionState, useState } from "react"
import { createRouteAction } from './actions'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export function CreateRouteForm({ shops }: { shops: any[] }) {
    const [state, formAction, isPending] = useActionState(createRouteAction, null)

    // Day Selection Logic
    const [mode, setMode] = useState<'CUSTOM' | 'EVERY'>('CUSTOM')
    const [selectedDays, setSelectedDays] = useState<string[]>([])

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
            setSelectedDays([])
        }
    }

    // Filter validation before submit? The server handles it.

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">Route Name</label>
                <input name="name" required className="block w-full border rounded p-2" placeholder="e.g. Morning Collection" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Frequency</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="frequency_mode"
                            checked={mode === 'EVERY'}
                            onChange={() => handleModeChange('EVERY')}
                        />
                        <span className="text-sm">Every Day</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="frequency_mode"
                            checked={mode === 'CUSTOM'}
                            onChange={() => handleModeChange('CUSTOM')}
                        />
                        <span className="text-sm">Custom / Specific Days</span>
                    </label>
                </div>

                {/* Hidden inputs to submit the actual days */}
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
                    {shops.length === 0 && <p className="text-sm text-gray-500 p-2">No shops available.</p>}
                    {shops.map(shop => (
                        <div key={shop.id} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" name="shopIds" value={shop.id} id={`shop-${shop.id}`} />
                            <label htmlFor={`shop-${shop.id}`} className="text-sm cursor-pointer w-full">
                                {shop.name} <span className="text-gray-400 text-xs">({shop.address})</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
                {isPending ? 'Creating Route...' : 'Create Route'}
            </button>

            {state?.error && (
                <p className="text-red-600 text-sm text-center">{state.error}</p>
            )}
        </form>
    )
}
