'use client'

import { addEmployeeAction } from './actions'
import { EmployeeForm } from './employee-form'

interface AddEmployeeFormProps {
    defaultDomain: string
}

export function AddEmployeeForm({ defaultDomain }: AddEmployeeFormProps) {
    return (
        <div>
            {/* Cache Bust: 2026-02-07 14:03 */}
            <div className="text-xs text-gray-400 mb-2 text-right">Domain Scope: @{defaultDomain}</div>
            <EmployeeForm action={addEmployeeAction} submitLabel="Add Employee" defaultDomain={defaultDomain} />
        </div>
    )
}
