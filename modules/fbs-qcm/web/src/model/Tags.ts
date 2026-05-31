export default interface Tags {
  id: string
  name: string
  parentId: Number
}

export default interface Item {
  id: string
  name: string
  tags: Tags[]
}

export default interface ItemTags {
  itemId: string
  tagId: string
}

const tags: Tags[] = [
  { id: '1', name: 'Tag 1', parentId: 0 },
  { id: '2', name: 'Tag 2', parentId: 0 },
  { id: '3', name: 'Tag 1.1', parentId: 1 },
  { id: '4', name: 'Tag 1.2', parentId: 1 },
  { id: '5', name: 'Tag 2.1', parentId: 2 }
]
