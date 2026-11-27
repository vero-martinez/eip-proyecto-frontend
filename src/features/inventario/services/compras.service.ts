import api from "@/lib/axios"

import type { StockEntry } from "../types"

export async function getComprasService(): Promise<StockEntry[]> {
    const { data } = await api.get<StockEntry[]>("/compras")
    return data
}
