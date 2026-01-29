'use client'

import { useActionState, useState } from "react"
import dynamic from "next/dynamic"

const LocationPickerWrapper = dynamic(() => import('./picker-wrapper'), { ssr: false })

interface ShopFormProps {
    action: (prevState: any, formData: FormData) => Promise<any>
    initialData?: {
        id?: string
        name: string
        address: string | null
        dueAmount: number
        mobile: string | null
        latitude: number | null
        longitude: number | null
        geofenceRadius: number
    }
    submitLabel: string
    deleteAction?: (formData: FormData) => Promise<any>
    extractAction?: (url: string) => Promise<{ lat?: string, lng?: string, error?: string }>
}

export function ShopForm({ action, initialData, submitLabel, deleteAction, extractAction }: ShopFormProps) {
    const [state, formAction, isPending] = useActionState(action, null)

    // Initialize state from props or default
    const [mode, setMode] = useState<'AUTO' | 'MAP' | 'LINK'>('AUTO')
    const [linkInput, setLinkInput] = useState('')
    const [coords, setCoords] = useState<{ lat: string, lng: string }>({
        lat: initialData?.latitude?.toString() || '',
        lng: initialData?.longitude?.toString() || ''
    })

    const handleMapSelect = (lat: number, lng: number) => {
        setCoords({ lat: lat.toString(), lng: lng.toString() })
    }

    const [isExtracting, setIsExtracting] = useState(false)

    const handleLinkPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLinkInput(e.target.value)
    }

    const handleExtract = async () => {
        const url = linkInput

        // Optimistic client-side check first (for speed on standard links)
        const patterns = [
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,
            /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
            /search\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) {
                setCoords({ lat: match[1], lng: match[2] })
                return
            }
        }

        // Fallback to server-side extraction for shortened URLs
        if (extractAction) {
            setIsExtracting(true)
            try {
                const result = await extractAction(url)
                if (result.lat && result.lng) {
                    setCoords({ lat: result.lat, lng: result.lng })
                } else {
                    alert(result.error || "Could not extract coordinates.")
                }
            } catch (error) {
                alert("Failed to extract coordinates.")
            } finally {
                setIsExtracting(false)
            }
        } else {
            alert("Could not extract coordinates from this link. Please try another format or manually select on map.")
        }
    }

    return (
        <div className="space-y-6">
            <form action={formAction} className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
                {initialData?.id && <input type="hidden" name="shopId" value={initialData.id} />}

                <div>
                    <label className="block text-sm font-medium">Shop Name</label>
                    <input name="name" required defaultValue={initialData?.name} className="block w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input name="address" defaultValue={initialData?.address || ''} className="block w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Due Amount</label>
                    <input name="dueAmount" type="number" defaultValue={initialData?.dueAmount || 0} className="block w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Mobile Number</label>
                    <input name="mobile" type="tel" defaultValue={initialData?.mobile || ''} className="block w-full border rounded p-2" placeholder="+91..." />
                </div>

                <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
                    <label className="block text-sm font-medium mb-2">Shop Location</label>

                    <div className="flex space-x-2 border-b pb-2">
                        <button type="button" onClick={() => setMode('AUTO')} className={`text-sm px-3 py-1 rounded ${mode === 'AUTO' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-500'}`}>📍 Auto / Manual</button>
                        <button type="button" onClick={() => setMode('MAP')} className={`text-sm px-3 py-1 rounded ${mode === 'MAP' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-500'}`}>🗺️ Mark on Map</button>
                        <button type="button" onClick={() => setMode('LINK')} className={`text-sm px-3 py-1 rounded ${mode === 'LINK' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-500'}`}>🔗 Google Maps Link</button>
                    </div>

                    {mode === 'AUTO' && (
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.geolocation.getCurrentPosition(pos => {
                                        setCoords({ lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() })
                                    })
                                }}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                📍 Detect My Current Location
                            </button>
                        </div>
                    )}

                    {mode === 'MAP' && (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Click edit/drag marker to update location.</p>
                            <LocationPickerWrapper
                                onLocationSelect={handleMapSelect}
                                initialLat={parseFloat(coords.lat) || undefined}
                                initialLng={parseFloat(coords.lng) || undefined}
                            />
                        </div>
                    )}

                    {mode === 'LINK' && (
                        <div className="flex gap-2">
                            <input
                                placeholder="Paste Google Maps URL here..."
                                className="block w-full border rounded p-2 text-sm"
                                value={linkInput}
                                onChange={handleLinkPaste}
                            />
                            <button
                                type="button"
                                onClick={handleExtract}
                                disabled={!linkInput || isExtracting}
                                className="bg-gray-800 text-white px-3 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                            >
                                {isExtracting ? 'Checking...' : 'Extract'}
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Latitude</label>
                            <input name="latitude" value={coords.lat} onChange={e => setCoords(prev => ({ ...prev, lat: e.target.value }))} className="block w-full border rounded p-2 bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Longitude</label>
                            <input name="longitude" value={coords.lng} onChange={e => setCoords(prev => ({ ...prev, lng: e.target.value }))} className="block w-full border rounded p-2 bg-white" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Geofence Radius (meters)</label>
                    <input name="geofenceRadius" type="number" defaultValue={initialData?.geofenceRadius || 500} className="block w-full border rounded p-2" />
                </div>

                {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

                <button type="submit" disabled={isPending} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 w-full">
                    {isPending ? 'Saving...' : submitLabel}
                </button>
            </form>

            {/* Delete Section */}
            {
                initialData?.id && deleteAction && (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50 space-y-2 mt-4">
                        <h3 className="text-red-800 font-bold text-sm">Danger Zone</h3>
                        <p className="text-red-600 text-xs">Deleting this shop is permanent and cannot be undone.</p>
                        <form action={async (formData) => {
                            if (confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
                                await deleteAction(formData)
                            }
                        }}>
                            <input type="hidden" name="shopId" value={initialData.id} />
                            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded text-sm w-full hover:bg-red-700">
                                Delete Shop
                            </button>
                        </form>
                    </div>
                )
            }
        </div>
    )
}
