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
    shops: any[]
}

export default function LiveMap({ employees, historyPaths, collectionPoints, shops }: LiveMapProps) {
    // Default center
    const defaultCenter: [number, number] = employees.length > 0 && employees[0].lastLatitude
        ? [employees[0].lastLatitude, employees[0].lastLongitude]
        : (shops.length > 0 && shops[0].latitude) ? [shops[0].latitude, shops[0].longitude] : [20.5937, 78.9629]

    const colors = ['blue', 'red', 'green', 'purple', 'orange']

    // Custom Shop Icon
    const shopIcon = L.divIcon({
        className: 'custom-shop-marker',
        html: `
            <div style="background-color: #7c3aed; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    })

    return (
        <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Shop Markers */}
            {shops && shops.map((shop) => {
                if (!shop.latitude || !shop.longitude) return null
                return (
                    <Marker
                        key={`shop-${shop.id}`}
                        position={[shop.latitude, shop.longitude]}
                        icon={shopIcon}
                    >
                        <Popup>
                            <div className="font-bold text-lg">{shop.name}</div>
                            <div className="text-sm text-gray-600">{shop.address}</div>
                            {shop.dueAmount > 0 && (
                                <div className="text-sm font-semibold text-red-600 mt-1">
                                    Due: ₹{shop.dueAmount}
                                </div>
                            )}
                        </Popup>
                    </Marker>
                )
            })}

            {/* Live Employee Markers */}
            {employees.map((emp, idx) => {
                if (!emp.lastLatitude || !emp.lastLongitude) return null

                const isOnDuty = emp.isOnDuty
                const mainColor = isOnDuty ? '#6366f1' : '#9ca3af' // Indigo-500 : Gray-400
                const darkColor = isOnDuty ? '#4338ca' : '#4b5563' // Indigo-700 : Gray-600
                const dotColor = isOnDuty ? '#4f46e5' : '#6b7280' // Indigo-600 : Gray-500
                const animation = isOnDuty ? 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite' : 'none'
                const ringOpacity = isOnDuty ? 0.6 : 0

                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <style>
                            @keyframes pulse-ring {
                                0% { transform: scale(0.33); opacity: 1; }
                                80%, 100% { transform: scale(1); opacity: 0; }
                            }
                        </style>
                        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
                            <div style="
                                background-color: white; 
                                padding: 6px 10px; 
                                border-radius: 20px; 
                                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
                                font-weight: 700; 
                                font-size: 13px; 
                                border: 2px solid ${mainColor};
                                color: ${darkColor};
                                white-space: nowrap;
                                margin-bottom: 8px;
                                position: relative;
                                z-index: 10;
                            ">
                                ${emp.name} ${!isOnDuty ? '<span style="font-weight:400; font-size:10px; opacity: 0.8">(Off)</span>' : ''}
                            </div>
                            <div style="position: relative; width: 24px; height: 24px;">
                                <div style="
                                    position: absolute;
                                    width: 100%;
                                    height: 100%;
                                    border-radius: 50%;
                                    background-color: ${mainColor};
                                    opacity: ${ringOpacity};
                                    animation: ${animation};
                                "></div>
                                <div style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    width: 12px; 
                                    height: 12px; 
                                    background-color: ${dotColor}; 
                                    border: 2px solid white; 
                                    border-radius: 50%; 
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                "></div>
                            </div>
                        </div>
                    `,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                })

                return (
                    <Marker
                        key={`emp-${emp.id}`}
                        position={[emp.lastLatitude, emp.lastLongitude]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className={`text-sm font-bold ${isOnDuty ? 'text-indigo-700' : 'text-gray-600'}`}>{emp.name}</div>
                            <div className="text-xs text-gray-500">
                                {isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Last Active: {emp.lastLocationUpdate ? new Date(emp.lastLocationUpdate).toLocaleTimeString() : 'Unknown'}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}

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
