'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { exportDutyLogsAction } from './actions'
import * as XLSX from 'xlsx'

interface DutyLogFiltersProps {
    employees: { id: string; name: string | null; email: string | null }[]
}

export function DutyLogFilters({ employees }: DutyLogFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isExporting, startTransition] = useTransition()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (key: string, value: string) => {
        router.push(pathname + '?' + createQueryString(key, value))
    }

    const handleExport = () => {
        startTransition(async () => {
            try {
                const filters = {
                    employeeId: searchParams.get('employeeId') || undefined,
                    status: searchParams.get('status') || undefined,
                    from: searchParams.get('from') || undefined,
                    to: searchParams.get('to') || undefined,
                }

                const data = await exportDutyLogsAction(filters)

                const worksheet = XLSX.utils.json_to_sheet(data)
                const workbook = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(workbook, worksheet, "Duty Logs")
                XLSX.writeFile(workbook, "DutyLogs.xlsx")
            } catch (error) {
                console.error("Export failed:", error)
                alert("Failed to export logs. Please try again.")
            }
        })
    }

    return (
        <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                <select
                    className="block w-full min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('employeeId') || ''}
                    onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.name || emp.email || 'Unnamed'}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('from') || ''}
                    onChange={(e) => handleFilterChange('from', e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('to') || ''}
                    onChange={(e) => handleFilterChange('to', e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                    className="block w-full min-w-[150px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('status') || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="ON">On Duty</option>
                    <option value="OFF">Off Duty</option>
                </select>
            </div>

            <div className="flex gap-4 items-center ml-auto">
                {(searchParams.get('employeeId') || searchParams.get('from') || searchParams.get('to') || searchParams.get('status')) && (
                    <button
                        onClick={() => router.push(pathname)}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Clear Filters
                    </button>
                )}

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                </button>
            </div>
        </div>
    )
}
