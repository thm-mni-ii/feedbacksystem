import { ResultData } from "./ResultData";

export interface ExcelCheckerResultData extends ResultData {
  type: "ExcelCheckerResultData";
  exercises: ExcelExercise[];
  passed: boolean;
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
