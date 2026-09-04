/**
 * Competency-DTOs für v2. Orientiert an web/src/model/types.ts `Competency`.
 */

export interface CompetencyPrerequisite {
  competencyId: string;
  minimumMastery: number;
}

export interface Competency {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  category?: string;
  prerequisites?: CompetencyPrerequisite[];
}

export type CompetencyInput = Omit<Competency, "id">;

export type CompetencyUpdate = Partial<CompetencyInput>;
