'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export function DutyLogFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Local state for debouncing if desired, but for now simple onChange
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                    type="text"
                    placeholder="Search name..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('name') || ''}
                    onChange={(e) => {
                        // Debounce could be added here, but for simplicity:
                        // handleFilterChange('name', e.target.value) 
                        // Actually, without debounce, typing is jarring due to reload.
                        // I'll use onBlur or Enter key for text? Or simple debounce.
                        // Let's use onChange with a small timeout or just simple.
                        // For now, let's use onBlur to trigger search to avoid lag while typing.
                    }}
                    onBlur={(e) => handleFilterChange('name', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFilterChange('name', e.currentTarget.value)
                    }}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('date') || ''}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    defaultValue={searchParams.get('status') || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="ON">On Duty</option>
                    <option value="OFF">Off Duty</option>
                </select>
            </div>

            {(searchParams.get('name') || searchParams.get('date') || searchParams.get('status')) && (
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
