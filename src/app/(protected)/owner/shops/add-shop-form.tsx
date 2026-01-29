'use client'

import { addShopAction, extractCoordinatesAction } from './actions'
import { ShopForm } from './shop-form'

export function AddShopForm() {
    return <ShopForm action={addShopAction} submitLabel="Add Shop" extractAction={extractCoordinatesAction} />
}
