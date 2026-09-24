export interface Course {
  id?: number;
  name: string;
  description?: string;
  visible?: boolean;
  semesterId?: number;
  groupSelection?: boolean;
}
