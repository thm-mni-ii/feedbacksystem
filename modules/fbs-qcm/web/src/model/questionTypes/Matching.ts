export interface MatchingCategory {
  id: string
  label: string
}

export interface MatchingItem {
  id: string
  text: string
  correctCategoryId: string
}

/**
 * Klassische Zuordnungsaufgabe: Jedes Item wird genau einer Kategorie zugeordnet.
 */
export interface Matching {
  categories: MatchingCategory[]
  items: MatchingItem[]
}
