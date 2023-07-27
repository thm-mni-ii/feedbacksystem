export interface ExcelCheckResult {
  exercises: ExcelExercise[];
}

export interface ExcelExercise {
  name: string;
  errorCell?: ExcelCell[];
  sheet: string;
  passed: boolean;
}

export interface ExcelCell {
  cellName: string;
  errorHint: string;
  propagatedErrorCell?: ExcelCell[];
  isPropagated?: boolean;
}
