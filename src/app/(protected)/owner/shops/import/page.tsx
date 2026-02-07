'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { importShopsAction, undoImportAction } from '../actions'
import { DownloadImportSampleButton } from '../sample-download'
import Link from 'next/link'

const initialState = {
    message: undefined as string | undefined,
    error: undefined as string | undefined,
    success: false,
    count: 0,
    createdCount: 0,
    updatedCount: 0,
    batchId: undefined as string | undefined
}

export default function ImportShopsPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(importShopsAction, initialState)
    const [undoState, setUndoState] = useState<{ loading: boolean, success: boolean, error?: string }>({ loading: false, success: false })
    const [isUndoing, startUndo] = useTransition()

    // Reset undo state when a new import happens
    useEffect(() => {
        if (state.success) {
            setUndoState({ loading: false, success: false })
        }
    }, [state])

    const handleUndo = () => {
        if (!state.batchId) return

        startUndo(async () => {
            const result = await undoImportAction(state.batchId!)
            if (result.success) {
                setUndoState({ loading: false, success: true })
            } else {
                setUndoState({ loading: false, success: false, error: result.error })
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Smart Import Shops</h1>
                <Link href="/owner/shops" className="text-gray-500 text-sm hover:underline">
                    ← Back to Shops
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                    <p className="font-semibold">How it works:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li><strong>Creates New:</strong> If a shop name is new, it will be created.</li>
                        <li><strong>Updates Existing:</strong> If a shop name matches, it will update the shop.</li>
                        <li><strong>Smart Update:</strong> Blank columns in Excel will <u>not</u> overwrite existing data. Only provided fields are updated.</li>
                    </ul>
                    <div className="mt-3">
                        <DownloadImportSampleButton />
                    </div>
                </div>

                {!state.success && (
                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Excel File</label>
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
                            {isPending ? 'Processing...' : 'Upload and Import'}
                        </button>
                    </form>
                )}

                {state?.error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        {state.error}
                    </div>
                )}

                {state?.success && !undoState.success && (
                    <div className="p-4 bg-green-50 text-green-800 rounded-md space-y-3">
                        <div>
                            <p className="font-bold text-lg">Import Complete! 🎉</p>
                            <ul className="list-disc pl-5 mt-2">
                                <li><strong>{state.createdCount}</strong> new shops created.</li>
                                <li><strong>{state.updatedCount}</strong> existing shops updated.</li>
                            </ul>
                        </div>

                        {state.batchId && (
                            <div className="pt-2 border-t border-green-200">
                                <p className="text-sm mb-2">Made a mistake?</p>
                                <button
                                    onClick={handleUndo}
                                    disabled={isUndoing}
                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    {isUndoing ? 'Reverting...' : '↩ Undo Last Import'}
                                </button>
                                {undoState.error && <p className="text-red-600 text-xs mt-1">{undoState.error}</p>}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-green-700 underline hover:text-green-900"
                            >
                                Import another file
                            </button>
                        </div>
                    </div>
                )}

                {undoState.success && (
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                        <p className="font-bold">Import was undone successfully.</p>
                        <p className="text-sm">The changes have been reverted.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm text-amber-900 underline"
                        >
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
