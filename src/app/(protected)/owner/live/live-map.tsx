'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface LiveMapProps {
    employees: any[]
    historyPaths: { [employeeId: string]: [number, number][] }
    collectionPoints: any[]
}

export default function LiveMap({ employees, historyPaths, collectionPoints }: LiveMapProps) {
    // Default center
    const defaultCenter: [number, number] = employees.length > 0 && employees[0].lastLatitude
        ? [employees[0].lastLatitude, employees[0].lastLongitude]
        : [20.5937, 78.9629]

    const colors = ['blue', 'red', 'green', 'purple', 'orange']

    return (
        <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Live Employee Markers */}
            {employees.map((emp, idx) => (
                emp.lastLatitude && emp.lastLongitude && (
                    <Marker
                        key={`emp-${emp.id}`}
                        position={[emp.lastLatitude, emp.lastLongitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="text-sm font-bold">{emp.name}</div>
                            <div className="text-xs">Live Location</div>
                        </Popup>
                    </Marker>
                )
            ))}

            {/* Travel Paths */}
            {Object.entries(historyPaths).map(([empId, path], idx) => (
                <Polyline
                    key={`path-${empId}`}
                    positions={path}
                    pathOptions={{ color: colors[idx % colors.length], weight: 4, opacity: 0.6 }}
                />
            ))}

            {/* Collection History Markers */}
            {collectionPoints.map(col => {
                if (!col.shop.latitude || !col.shop.longitude || !col.latitude || !col.longitude) return null

                // Calculate distance
                const shopLoc = L.latLng(col.shop.latitude, col.shop.longitude)
                const colLoc = L.latLng(col.latitude, col.longitude)
                const distance = shopLoc.distanceTo(colLoc) // meters
                const radius = col.shop.geofenceRadius || 500

                let color = 'green'
                let status = 'Verified'
                if (distance > radius * 2) {
                    color = 'red'
                    status = 'Suspicious (Far)'
                } else if (distance > radius) {
                    color = 'orange' // Yellow/Orange
                    status = 'Warning (Outside Fence)'
                }

                return (
                    <CircleMarker
                        key={`col-${col.id}`}
                        center={[col.latitude, col.longitude]}
                        radius={6}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.8 }}
                    >
                        <Popup>
                            <div className="font-bold">₹{col.amount} Collected</div>
                            <div className="text-xs">{col.shop.name}</div>
                            <div className="text-xs text-gray-500">{new Date(col.collectedAt).toLocaleTimeString()}</div>
                            <div className={`text-xs font-bold ${distance > radius ? 'text-red-600' : 'text-green-600'}`}>
                                {status}: {Math.round(distance)}m from shop
                            </div>
                        </Popup>
                    </CircleMarker>
                )
            })}
        </MapContainer>
    )
}
