/**
 * Servicio de reposición de stock (zona 2 de analítica).
 */

import api from "@/lib/axios"

import type { ReposicionStock } from "../types"

/** Cuánto dura el stock de cada producto y cuánto conviene pedir. */
export async function getReposicionService(): Promise<ReposicionStock> {
    const { data } = await api.get<ReposicionStock>("/analitica/reposicion")
    return data
}