'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { dueUpdateShopsAction, undoImportAction } from '../actions'
import { DownloadBulkUpdateSampleButton } from '../sample-download' // Keeping component name or aliasing? I'll correct imports
import Link from 'next/link'

const initialState = {
    message: undefined as string | undefined,
    error: undefined as string | undefined,
    success: false,
    updatedCount: 0,
    missingShops: [] as string[],
    batchId: undefined as string | undefined
}

export default function DueUpdateShopsPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(dueUpdateShopsAction, initialState)
    const [undoState, setUndoState] = useState<{ loading: boolean, success: boolean, error?: string }>({ loading: false, success: false })
    const [isUndoing, startUndo] = useTransition()

    // Reset undo state on new submission
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
                <h1 className="text-2xl font-bold">Due Update</h1>
                <Link href="/owner/shops" className="text-gray-500 text-sm hover:underline">
                    ← Back to Shops
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                    <p className="font-semibold">Instructions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Upload an Excel file with <strong>Shop Name</strong> and <strong>Due Amount</strong>.</li>
                        <li>This will only update the "Due Amount" for matching shops.</li>
                        <li>Other fields (Address, Mobile) are ignored.</li>
                    </ul>
                    <div className="mt-2 text-left">
                        <DownloadBulkUpdateSampleButton />
                    </div>
                </div>

                {!state.success && (
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
                            {isPending ? 'Updating...' : 'Upload and Update Dues'}
                        </button>
                    </form>
                )}

                {state?.error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        {state.error}
                    </div>
                )}

                {state?.success && !undoState.success && (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 text-green-800 rounded-md">
                            <p className="font-semibold">Success!</p>
                            <p>Updated dues for {state.updatedCount} shops.</p>

                            {state.missingShops && state.missingShops.length > 0 && (
                                <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
                                    <p className="font-semibold">Warning: {state.missingShops.length} shops not found:</p>
                                    <ul className="list-disc pl-5 mt-1 max-h-32 overflow-y-auto">
                                        {state.missingShops.map((name: string, i: number) => (
                                            <li key={i}>{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {state.batchId && (
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Mistake?</p>
                                        <p className="text-xs text-gray-500">Undo available for 5 minutes.</p>
                                    </div>
                                    <button
                                        onClick={handleUndo}
                                        disabled={isUndoing}
                                        className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        {isUndoing ? 'Reverting...' : '↩ Undo Updates'}
                                    </button>
                                </div>
                                {undoState.error && <p className="text-red-600 text-xs mt-2">{undoState.error}</p>}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                            >
                                Process another file
                            </button>
                        </div>
                    </div>
                )}

                {undoState.success && (
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
                        <p className="font-bold">Updates Reverted</p>
                        <p className="text-sm">The due amounts have been restored to their previous values.</p>
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
