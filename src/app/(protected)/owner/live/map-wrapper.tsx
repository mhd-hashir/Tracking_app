'use client'

import dynamic from 'next/dynamic'

// Dynamically import map to disable SSR
const LiveMap = dynamic(() => import('./live-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading Map...</div>
})

export default function MapWrapper({ employees, historyPaths, collectionPoints }: {
    employees: any[],
    historyPaths: any,
    collectionPoints: any[]
}) {
    return <LiveMap employees={employees} historyPaths={historyPaths} collectionPoints={collectionPoints} />
}
