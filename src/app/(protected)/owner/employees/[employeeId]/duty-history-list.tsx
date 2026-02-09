'use client'

interface DutyLog {
    id: string
    status: string
    latitude: number | null
    longitude: number | null
    timestamp: Date
}

export function DutyHistoryList({ logs }: { logs: DutyLog[] }) {
    if (logs.length === 0) {
        return <div className="text-gray-500 text-sm">No duty history recorded.</div>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Time</th>
                        <th className="px-4 py-2">Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.status === 'ON' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {log.status === 'ON' ? 'ON DUTY' : 'OFF DUTY'}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                                {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                                {log.latitude && log.longitude ? (
                                    <a
                                        href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                    >
                                        📍 View
                                    </a>
                                ) : (
                                    <span className="text-gray-400 italic">No GPS</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
