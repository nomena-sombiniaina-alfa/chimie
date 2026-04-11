import type {
  Category, ElementListItem, ElementDetail, Source,
  UnitListItem, UnitDetail, SIConstant,
  BondListItem, BondDetail,
  ReactionListItem, ReactionDetail,
} from '../types'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Elements
  listElements: () => fetchJSON<ElementListItem[]>('/elements/'),
  getElement:   (Z: number) => fetchJSON<ElementDetail>(`/elements/${Z}/`),
  listCategories: () => fetchJSON<Category[]>('/categories/'),
  listSources:  () => fetchJSON<Source[]>('/sources/'),

  // Units
  listUnits:    () => fetchJSON<UnitListItem[]>('/units/'),
  getUnit:      (slug: string) => fetchJSON<UnitDetail>(`/units/${slug}/`),
  listConstants:() => fetchJSON<SIConstant[]>('/si-constants/'),

  // Bonds
  listBonds:    () => fetchJSON<BondListItem[]>('/bonds/'),
  getBond:      (slug: string) => fetchJSON<BondDetail>(`/bonds/${slug}/`),

  // Reactions
  listReactions: () => fetchJSON<ReactionListItem[]>('/reactions/'),
  getReaction:   (slug: string) => fetchJSON<ReactionDetail>(`/reactions/${slug}/`),
}
