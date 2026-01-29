'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { getShopExportData, getAllShopsExportData } from './actions'

interface ExportButtonProps {
    mode: 'SINGLE' | 'ALL'
    shopId?: string
}

export function ExportButton({ mode, shopId }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        try {
            setLoading(true)

            if (mode === 'SINGLE' && shopId) {
                const data = await getShopExportData(shopId)
                if ('error' in data) {
                    alert(data.error)
                    return
                }

                const wb = XLSX.utils.book_new()

                // Sheet 1: Details
                const wsDetails = XLSX.utils.json_to_sheet([data.shop])
                XLSX.utils.book_append_sheet(wb, wsDetails, "Shop Details")

                // Sheet 2: Collections
                const wsCollections = XLSX.utils.json_to_sheet(data.collections)
                XLSX.utils.book_append_sheet(wb, wsCollections, "Collections")

                XLSX.writeFile(wb, `${data.shop.Name}_Store_Data.xlsx`)

            } else {
                const data = await getAllShopsExportData()
                if ('error' in data) {
                    alert(data.error)
                    return
                }

                // @ts-ignore
                const ws = XLSX.utils.json_to_sheet(data)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, "All Shops")

                XLSX.writeFile(wb, "All_Shops_Export.xlsx")
            }

        } catch (error) {
            console.error(error)
            alert("Failed to export data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors
                ${mode === 'SINGLE'
                    ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                    : 'text-gray-700 bg-white border hover:bg-gray-50'
                }
            `}
        >
            {loading ? 'Exporting...' : (
                <>
                    📥 {mode === 'SINGLE' ? 'Export Shop Data' : 'Export All'}
                </>
            )}
        </button>
    )
}
