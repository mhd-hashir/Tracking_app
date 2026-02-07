'use client'

import * as XLSX from 'xlsx'

export function DownloadImportSampleButton() {
    const handleDownload = () => {
        const headers = [
            { Name: 'Shop 1', Address: '123 Main St', Mobile: '9876543210', DueAmount: 0 },
            { Name: 'Shop 2', Address: '456 Market Rd', Mobile: 'Optional', DueAmount: 1500 }
        ]
        const ws = XLSX.utils.json_to_sheet(headers)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Shops')
        XLSX.writeFile(wb, 'import_shops_sample.xlsx')
    }

    return (
        <button
            onClick={handleDownload}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium underline px-2"
        >
            Download Sample
        </button>
    )
}

export function DownloadBulkUpdateSampleButton() {
    const handleDownload = () => {
        const headers = [
            { 'Shop Name': 'Shop 1', 'Due Amount': 500 },
            { 'Shop Name': 'Shop 2', 'Due Amount': 1200 }
        ]
        const ws = XLSX.utils.json_to_sheet(headers)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Updates')
        XLSX.writeFile(wb, 'bulk_update_sample.xlsx')
    }

    return (
        <button
            type="button"
            onClick={handleDownload}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium underline flex items-center gap-1"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Sample Template
        </button>
    )
}
