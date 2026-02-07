'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { getCollectionsReport, getFilterOptions } from './actions'

export default function DataPage() {
    // Default to current month
    const date = new Date()
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
    const currentDay = date.toISOString().split('T')[0]

    const [startDate, setStartDate] = useState(firstDay)
    const [endDate, setEndDate] = useState(currentDay)
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<{ summary: any, data: any[] } | null>(null)

    // Filters
    const [options, setOptions] = useState<{ shops: any[], employees: any[] }>({ shops: [], employees: [] })
    const [selectedShop, setSelectedShop] = useState('ALL')
    const [selectedEmployee, setSelectedEmployee] = useState('ALL')
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL')

    useEffect(() => {
        // Fetch filter options on mount
        getFilterOptions().then(data => {
            if (data) setOptions(data)
        })
    }, [])

    const handleGenerate = async () => {
        try {
            setLoading(true)
            const filters = {
                shopId: selectedShop,
                employeeId: selectedEmployee,
                paymentMode: selectedPaymentMode
            }
            const result = await getCollectionsReport(new Date(startDate), new Date(endDate), filters)

            if ('error' in result) {
                alert(result.error)
                return
            }

            setReport(result as any)
        } catch (error) {
            console.error(error)
            alert("Failed to generate report")
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        if (!report || !report.data.length) return

        const ws = XLSX.utils.json_to_sheet(report.data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Collection Report")

        XLSX.writeFile(wb, `Report_${startDate}_to_${endDate}.xlsx`)
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">Data & Reports</h1>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full border rounded p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full border rounded p-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
                        <select
                            value={selectedShop}
                            onChange={(e) => setSelectedShop(e.target.value)}
                            className="block w-full border rounded p-2 text-sm"
                        >
                            <option value="ALL">All Shops</option>
                            {options.shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collected By</label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="block w-full border rounded p-2 text-sm"
                        >
                            <option value="ALL">All Employees</option>
                            {options.employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            value={selectedPaymentMode}
                            onChange={(e) => setSelectedPaymentMode(e.target.value)}
                            className="block w-full border rounded p-2 text-sm"
                        >
                            <option value="ALL">All Methods</option>
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="CHECK">Check</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {report && (
                <div className="space-y-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-sm text-green-600 font-medium">Total Collected</div>
                            <div className="text-2xl font-bold text-green-800">
                                ₹{report.summary.totalCollected.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-600 font-medium">Transactions</div>
                            <div className="text-2xl font-bold text-blue-800">{report.summary.transactionCount}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                        >
                            📥 Export to Excel
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Mode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Due</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {report.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No records found for this period.</td>
                                        </tr>
                                    ) : (
                                        report.data.map((row) => (
                                            <tr key={row.id}>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <div>{row.Date}</div>
                                                    <div className="text-gray-400 text-xs">{row.Time}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{row['Shop Name']}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-600">₹{row['Collected Amount']}</td>
                                                <td className="px-6 py-4 text-sm">{row['Collected By']}</td>
                                                <td className="px-6 py-4 text-sm">{row['Payment Mode']}</td>
                                                <td className="px-6 py-4 text-sm text-red-600">₹{row['Current Due']}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
