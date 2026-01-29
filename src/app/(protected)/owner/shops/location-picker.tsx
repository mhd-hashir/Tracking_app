'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'

const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            map.flyTo(e.latlng, map.getZoom())
        }
    })

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    return position === null ? null : (
        <Marker position={position} icon={icon} />
    )
}

export default function LocationPicker({
    onLocationSelect,
    initialLat,
    initialLng
}: {
    onLocationSelect: (lat: number, lng: number) => void,
    initialLat?: number,
    initialLng?: number
}) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null
    )

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition(new L.LatLng(initialLat, initialLng))
        }
    }, [initialLat, initialLng])

    // Default to India or initial
    const center: [number, number] = initialLat && initialLng
        ? [initialLat, initialLng]
        : [20.5937, 78.9629]

    const handleSetPosition = (pos: L.LatLng) => {
        setPosition(pos)
        onLocationSelect(pos.lat, pos.lng)
    }

    return (
        <MapContainer center={center} zoom={5} style={{ height: '300px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <LocationMarker position={position} setPosition={handleSetPosition} />
        </MapContainer>
    )
}
