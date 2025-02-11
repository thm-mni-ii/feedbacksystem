export interface Group {
  id: number;
  courseId: number;
  name: string;
  membership: number;
  visible?: boolean;
}

export interface GroupInput {
  name: string;
  membership: number;
  visible: boolean;
}
