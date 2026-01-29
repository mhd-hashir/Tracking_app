'use client'

import { useEffect, useState } from 'react'
import { updateLocationAction } from './location-actions'

export function LocationTracker() {
    const [status, setStatus] = useState<string>('Initializing...')

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setStatus('Geolocation not supported')
            return
        }

        const update = () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setStatus('Updating...')
                    const { latitude, longitude } = position.coords
                    await updateLocationAction(latitude, longitude)
                    setStatus(`Last updated: ${new Date().toLocaleTimeString()}`)
                },
                (error) => {
                    console.error(error)
                    setStatus('Error getting location')
                },
                { enableHighAccuracy: true }
            )
        }

        // Update immediately, then every 30s
        update()
        const interval = setInterval(update, 30000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 text-center backdrop-blur-sm z-50">
            📍 Location Tracker: {status}
        </div>
    )
}
