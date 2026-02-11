'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface DutyLogFiltersProps {
    employees: { id: string; name: string | null }[]
}

export function DutyLogFilters({ employees }: DutyLogFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

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
                            {emp.name || 'Unnamed'}
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

            {(searchParams.get('employeeId') || searchParams.get('from') || searchParams.get('to') || searchParams.get('status')) && (
                <button
                    onClick={() => router.push(pathname)}
                    className="text-sm text-red-600 hover:text-red-800 underline self-center mt-4 md:mt-0"
                >
                    Clear Filters
                </button>
            )}
        </div>
    )
}
