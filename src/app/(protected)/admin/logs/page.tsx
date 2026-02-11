
'use client';

import React, { useEffect, useState } from 'react';

interface SystemLog {
    id: string;
    level: string;
    message: string;
    createdAt: string;
    userId?: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/system/logs')
            .then((res) => res.json())
            .then((data) => {
                if (data.logs) setLogs(data.logs);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-4">Loading logs...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Logs</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                                            log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{log.message}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userId || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
