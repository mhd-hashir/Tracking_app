
'use client';

import React, { useEffect, useState } from 'react';

interface Broadcast {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isActive: boolean;
}

export default function BroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchBroadcasts = () => {
        fetch('/api/admin/system/broadcasts')
            .then((res) => res.json())
            .then((data) => {
                if (data.broadcasts) setBroadcasts(data.broadcasts);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/system/broadcasts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setForm({ title: '', message: '' });
                fetchBroadcasts();
            } else {
                alert('Failed to send broadcast');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-xl font-bold tracking-tight text-gray-800">Broadcast Notifications</h2>
                <div className="text-sm text-gray-500">Send alerts to all mobile users</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Send New Broadcast</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            required
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
                    >
                        {submitting ? 'Sending...' : 'Send Broadcast'}
                    </button>
                </form>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Active Broadcasts</h3>
                </div>
                <div className="border-t border-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {broadcasts.map((broadcast) => (
                            <li key={broadcast.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-indigo-600 truncate">{broadcast.title}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {broadcast.message}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <p>
                                            Sent on <time dateTime={broadcast.createdAt}>{new Date(broadcast.createdAt).toLocaleDateString()}</time>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {broadcasts.length === 0 && (
                            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No active broadcasts</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
