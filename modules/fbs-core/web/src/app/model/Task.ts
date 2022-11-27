export interface Task {
  id?: number;
  name: string;
  description?: string;
  deadline?: string;
  expCheck?: boolean;
  requirementType: string;
  mediaType?: string;
  mediaInformation?:
    | SpreadsheetMediaInformation
    | SpreadsheetResponseMediaInformation;
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
