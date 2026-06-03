export interface Task {
  id?: number;
  name: string;
  isPrivate?: boolean;
  description?: string;
  deadline?: string;
  requirementType: string;
  mediaType?: string;
  mediaInformation?:
    | SpreadsheetMediaInformation
    | SpreadsheetResponseMediaInformation;
  stagedFeedbackEnabled?: boolean;
  stagedFeedbackLimit?: number;
}

export interface SpreadsheetMediaInformation {
  idField: string;
  inputFields: string;
  outputFields: string;
  pointFields?: string;
  decimals: number;
}

export interface SpreadsheetResponseMediaInformation {
  inputs: string[][];
  outputs: string[];
  decimals: number;
  mediaInformation: SpreadsheetMediaInformation;
}
