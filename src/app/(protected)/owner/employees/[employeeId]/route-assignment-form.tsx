'use client'

import { useActionState } from "react"
import { updateEmployeeRoutesAction } from '../actions'

type Route = {
    id: string
    name: string
    dayOfWeek: string
    assignedToId?: string | null
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export function RouteAssignmentForm({
    employeeId,
    allRoutes,
    assignedRoutes
}: {
    employeeId: string,
    allRoutes: Route[],
    assignedRoutes: Route[]
}) {
    const [state, formAction, isPending] = useActionState(updateEmployeeRoutesAction, null)

    // Helper to get selected route ID for a day
    const getAssignedRouteId = (day: string) => {
        const route = assignedRoutes.find(r => r.dayOfWeek === day)
        return route ? route.id : 'NONE'
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="employeeId" value={employeeId} />

            <div className="grid gap-4 sm:grid-cols-2">
                {DAYS.map(day => {
                    const availableRoutes = allRoutes.filter(r => r.dayOfWeek === day)
                    const currentId = getAssignedRouteId(day)

                    return (
                        <div key={day} className="p-3 border rounded bg-gray-50">
                            <label className="block text-xs font-bold text-gray-500 mb-1">{day}</label>
                            <select
                                name={`route_${day}`}
                                defaultValue={currentId}
                                className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="NONE">No Route Assigned</option>
                                {availableRoutes.map(route => {
                                    const isAssignedToOther = route.assignedToId && route.assignedToId !== employeeId
                                    return (
                                        <option
                                            key={route.id}
                                            value={route.id}
                                            disabled={!!isAssignedToOther} // Should we disable? Or allow stealing?
                                        // The user didn't specify. Standard behavior: allow stealing if owner overrides.
                                        // But "disabled" is safer to prevent accidental reassignment?
                                        // Let's NOT disable, but add label if taken.
                                        >
                                            {route.name} {isAssignedToOther ? '(Assigned to another)' : ''}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                >
                    {isPending ? 'Saving Schedule...' : 'Save Schedule'}
                </button>
            </div>

            {state?.success && (
                <p className="text-sm text-green-600 font-medium text-right">Schedule updated successfully!</p>
            )}
            {state?.error && (
                <p className="text-sm text-red-600 font-medium text-right">{state.error}</p>
            )}
        </form>
    )
}
