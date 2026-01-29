'use client'

import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('./location-picker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
})

export default LocationPicker
