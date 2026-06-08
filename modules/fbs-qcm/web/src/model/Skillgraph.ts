export interface Skill {
  id: string
  name: string
  description: string
}

export interface Tag {
  id: string
  label: string
  parentId?: string
}

export interface Question {
  id: string
  title: string
  difficulty?: number
  skillIds: string[]
  tagIds: string[]
}
