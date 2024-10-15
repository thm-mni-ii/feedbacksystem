export interface Catalog {
  id: string;
  name: string;
  difficulty?: number;
  passed?: boolean;
  questions?: any[];
  requirements: number[];
  course?: number;
}
