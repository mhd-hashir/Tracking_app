'use client'

import { useActionState } from "react"
import { createRouteAction } from './actions'

export function CreateRouteForm({ shops }: { shops: any[] }) {
    const [state, formAction, isPending] = useActionState(createRouteAction, null)

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Route Name</label>
                <input name="name" required className="block w-full border rounded p-2" placeholder="e.g. Saturday East Zone" />
            </div>

            <div>
                <label className="block text-sm font-medium">Day of Week</label>
                <select name="dayOfWeek" className="block w-full border rounded p-2">
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="SUNDAY">Sunday</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Select Shops for this Route</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {shops.map(shop => (
                        <div key={shop.id} className="flex items-center gap-2">
                            <input type="checkbox" name="shopIds" value={shop.id} id={`shop-${shop.id}`} />
                            <label htmlFor={`shop-${shop.id}`} className="text-sm">{shop.name} - {shop.address}</label>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
                {isPending ? 'Creating...' : 'Create Route'}
            </button>
        </form>
    )
}
