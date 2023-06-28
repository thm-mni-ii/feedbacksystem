// export interface ExcelCheckResult {
//   exercises: ExcelExcercise[];
//   table: string;
// }

// export interface ExcelExcercise {
//   name: string;
//   cells: ExcerciseCell[];
//   successfulAttempt: boolean;
// }

// export interface ExcerciseCell {
//   identifier: string; // the identified cell
//   errorHint: string; // the tip/Hint for finding the error
//   isProperGated: boolean; // the propergated error
// }

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
