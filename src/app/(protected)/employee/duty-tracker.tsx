'use client'

import { useEffect, useState } from 'react'
import { updateLocationAction, toggleDutyAction } from './location-actions'

export function DutyTracker({ initialStatus }: { initialStatus: boolean }) {
    const [isOnDuty, setIsOnDuty] = useState(initialStatus)
    const [status, setStatus] = useState<string>(initialStatus ? 'Initializing...' : 'Tracking Paused')

    useEffect(() => {
        if (!isOnDuty) {
            setStatus('Tracking Paused')
            return
        }

        if (!('geolocation' in navigator)) {
            setStatus('GPS not supported')
            return
        }

        const update = () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setStatus('Updating location...')
                    const { latitude, longitude } = position.coords
                    const res = await updateLocationAction(latitude, longitude)
                    if (res?.error) {
                        setStatus(`Error: ${res.error}`)
                    } else {
                        setStatus(`Active • Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
                    }
                },
                (error) => {
                    console.error(error)
                    setStatus('GPS Error - Check Permissions')
                },
                { enableHighAccuracy: true }
            )
        }

        // Update immediately, then every 30s
        update()
        const interval = setInterval(update, 30000)

        return () => clearInterval(interval)
    }, [isOnDuty])

    const handleToggle = async () => {
        setStatus('Updating status...')

        // Try to get location for the log
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                const newState = !isOnDuty
                setIsOnDuty(newState)

                const res = await toggleDutyAction(newState, latitude, longitude)
                if (res?.error) {
                    alert(res.error)
                    setIsOnDuty(!newState)
                } else {
                    setStatus(newState ? 'Active' : 'Tracking Paused')
                }
            },
            async (error) => {
                console.error('Location failed for toggle:', error)
                // Proceed without location if GPS fails (e.g. signal loss when turning off)
                const newState = !isOnDuty
                setIsOnDuty(newState)

                const res = await toggleDutyAction(newState)
                if (res?.error) {
                    alert(res.error)
                    setIsOnDuty(!newState)
                } else {
                    setStatus(newState ? 'Active (No GPS Log)' : 'Tracking Paused')
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-6 flex items-center justify-between shadow-lg z-[9999]">
            <div>
                <div className="font-bold text-sm flex items-center gap-2">
                    {isOnDuty ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            ON DUTY
                        </span>
                    ) : (
                        <span className="text-gray-500">OFF DUTY</span>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{status}</div>
            </div>

            <button
                onClick={handleToggle}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isOnDuty ? 'bg-green-500' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isOnDuty ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    )
}
