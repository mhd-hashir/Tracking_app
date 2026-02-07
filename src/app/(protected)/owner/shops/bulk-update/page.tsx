'use client'

import { useActionState } from 'react'
import { bulkUpdateShopDuesAction } from '../actions'
import { DownloadBulkUpdateSampleButton } from '../sample-download'
import Link from 'next/link'

const initialState = {
    message: undefined as string | undefined, // Not used but harmless
    error: undefined as string | undefined,
    success: false,
    updatedCount: 0,
    missingShops: [] as string[]
}

export default function BulkUpdatePage() {
    const [state, formAction, isPending] = useActionState(bulkUpdateShopDuesAction, initialState)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Bulk Update Shop Dues</h1>
                <Link href="/owner/shops" className="text-gray-500 text-sm hover:underline">
                    ← Back to Shops
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                    <p className="font-semibold">Instructions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Upload an Excel file (.xlsx) or CSV.</li>
                        <li>The file must have columns: <strong>Shop Name</strong> and <strong>Due Amount</strong>.</li>
                        <li>Shop names must match exactly (case-insensitive).</li>
                    </ul>
                    <div className="mt-2">
                        <DownloadBulkUpdateSampleButton />
                    </div>
                </div>

                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select File</label>
                        <input
                            type="file"
                            name="file"
                            accept=".xlsx, .xls, .csv"
                            required
                            className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                    >
                        {isPending ? 'Processing...' : 'Upload and Update'}
                    </button>
                </form>

                {state?.error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-md">
                            <p className="font-semibold">Success!</p>
                            <p>Updated dues for {state.updatedCount} shops.</p>
                        </div>

                        {state.missingShops && state.missingShops.length > 0 && (
                            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                                <p className="font-semibold">Warning: {state.missingShops.length} shops were not found:</p>
                                <ul className="mt-2 list-disc pl-5 text-sm max-h-60 overflow-y-auto">
                                    {state.missingShops.map((name: string, i: number) => (
                                        <li key={i}>{name}</li>
                                    ))}
                                </ul>
                                <p className="mt-2 text-xs">Please check the spelling in your Excel file and try again.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
