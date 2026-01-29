'use client'

import { useActionState, useEffect, useState } from "react"
import { submitCollectionAction } from './actions'

export function CollectForm({ shopId, dueAmount }: { shopId: string, dueAmount: number }) {
    const [state, formAction, isPending] = useActionState(submitCollectionAction, null)
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (err) => {
                    setLocationError('Location access denied or unavailable.')
                }
            )
        } else {
            setLocationError('Geolocation not supported by this device.')
        }
    }, [])

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="shopId" value={shopId} />
            {location && (
                <>
                    <input type="hidden" name="latitude" value={location.lat} />
                    <input type="hidden" name="longitude" value={location.lng} />
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Amount Collected</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        required
                        className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-lg"
                        placeholder="0.00"
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">Maximum due: ₹{dueAmount}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                <select name="paymentMode" className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border">
                    <option value="CASH">Cash</option>
                    <option value="UPI">Google Pay / UPI</option>
                    <option value="CHECK">Check</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea name="remarks" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Optional notes..."></textarea>
            </div>

            {locationError && (
                <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ {locationError} (Location tagging disabled)
                </div>
            )}

            {location && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                    📍 Location acquired ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                </div>
            )}

            {state?.error && <div className="text-red-500 text-sm font-bold">{state.error}</div>}

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {isPending ? 'Processing...' : 'CONFIRM COLLECTION'}
            </button>
        </form>
    )
}
