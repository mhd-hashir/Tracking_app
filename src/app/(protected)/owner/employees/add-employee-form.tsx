'use client'

import { addEmployeeAction } from './actions'
import { EmployeeForm } from './employee-form'

interface AddEmployeeFormProps {
    defaultDomain: string
}

export function AddEmployeeForm({ defaultDomain }: AddEmployeeFormProps) {
    return <EmployeeForm action={addEmployeeAction} submitLabel="Add Employee" defaultDomain={defaultDomain} />
}
