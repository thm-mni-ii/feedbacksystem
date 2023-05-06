export interface ExcelCheckResult {
  excercises: ExcelExcercise[];
  table: object;
}

export interface ExcelExcercise {
  name: string;
  cells: ExcerciseCell[];
  succesfulAttempt: boolean;
}

export interface ExcerciseCell {
  identifier: string; // the identified cell
  errorHint: string; // the tip/Hint for finding the error
  isProperGated: boolean; // the propergated error
}
