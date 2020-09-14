import {CheckResult} from "./CheckResult";

export interface Submission {
  submissionTime: number; // Unix time as long
  done: boolean; // True if all checkers have checked the submissions
  id: number;
  results: CheckResult[]; // The check results of each configured checker, may be empty
}
