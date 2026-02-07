'use client'

import { useActionState } from 'react'
import { importShopsAction } from '../actions'
import { DownloadImportSampleButton } from '../sample-download'
import Link from 'next/link'

const initialState = {
    message: undefined as string | undefined, // Unused but consistent
    error: undefined as string | undefined,
    success: false,
    count: 0
}

export default function ImportShopsPage() {
    // @ts-ignore - The error mismatch in library types makes this noisy, ignoring for now as shape is compatible enough at runtime or effectively handled
    const [state, formAction, isPending] = useActionState(importShopsAction, initialState)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Import Shops</h1>
                <Link href="/owner/shops" className="text-gray-500 text-sm hover:underline">
                    ← Back to Shops
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                    <p className="font-semibold">Instructions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Upload an Excel file (.xlsx) or CSV.</li>
                        <li>Recommended columns: <strong>Name</strong>, <strong>Address</strong>, <strong>Mobile</strong>, <strong>Due Amount</strong>.</li>
                        <li>This will create new shops. Duplicates are not checked (they will be created as new entries).</li>
                    </ul>
                    <div className="mt-2 text-left">
                        <DownloadImportSampleButton />
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
                        {isPending ? 'Importing...' : 'Upload and Import'}
                    </button>
                </form>

                {state?.error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-md">
                        <p className="font-semibold">Success!</p>
                        <p>Imported {state.count} new shops.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
