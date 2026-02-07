'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { importShopsAction } from './actions'
import { DownloadImportSampleButton } from './sample-download'

export function ImportShopsButton() {
    const [loading, setLoading] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        const reader = new FileReader()

        reader.onload = async (evt) => {
            const bstr = evt.target?.result
            const wb = XLSX.read(bstr, { type: 'binary' })
            const wsname = wb.SheetNames[0]
            const ws = wb.Sheets[wsname]
            const data = XLSX.utils.sheet_to_json(ws)

            // Send to server action
            // Expected headers: Name, Address, DueAmount
            await importShopsAction(data)
            setLoading(false)
            window.location.reload()
        }

        reader.readAsBinaryString(file)
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={loading}
                />
                <button disabled={loading} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    {loading ? 'Importing...' : 'Import from Excel'}
                </button>
            </div>
            <DownloadImportSampleButton />
        </div>
    )
}
