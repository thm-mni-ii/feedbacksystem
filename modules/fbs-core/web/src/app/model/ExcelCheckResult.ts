export interface ExcelCheckResult {
  exercises: ExcelExercise[];
}

export interface ExcelExercise {
  name: string;
  errorCell?: ExcelCell[];
  table: string;
  result: boolean;
}

export interface ExcelCell {
  cellName: string;
  errorHint: string;
  consequentErrorCell?: ExcelCell[];
  isConsequent?: boolean;
}
