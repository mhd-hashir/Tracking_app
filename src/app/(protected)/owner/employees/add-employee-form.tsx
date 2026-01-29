'use client'

import { addEmployeeAction } from './actions'
import { EmployeeForm } from './employee-form'

export function AddEmployeeForm() {
    return <EmployeeForm action={addEmployeeAction} submitLabel="Add Employee" />
}
