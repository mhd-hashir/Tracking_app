'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/owner', label: 'Dashboard', exact: true },
    { href: '/owner/employees', label: 'Employees' },
    { href: '/owner/shops', label: 'Shops' },
    { href: '/owner/data', label: 'Data' },
    { href: '/owner/routes', label: 'Routes' },
    { href: '/owner/live', label: '🔴 Live Map', className: 'text-red-500 font-semibold hover:text-red-700' } // Adjusted style slightly for consistency
]

export function OwnerNav() {
    const pathname = usePathname()

    return (
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                // For "Live Map", maintain specific styling but add active state if needed.
                // Assuming standard items use standard active style.

                let className = "transition flex items-center gap-1"

                if (item.label === '🔴 Live Map') {
                    className = isActive
                        ? "text-red-600 font-bold hover:text-red-800"
                        : "text-red-500 font-semibold hover:text-red-700"
                } else {
                    className += isActive
                        ? " text-indigo-700 font-bold border-b-2 border-indigo-600 pb-1" // Darker, bolder, underlined
                        : " text-gray-600 hover:text-indigo-600 pb-1 border-b-2 border-transparent"
                }

                return (
                    <Link key={item.href} href={item.href} className={className}>
                        {item.label}
                    </Link>
                )
            })}
        </nav>
    )
}
