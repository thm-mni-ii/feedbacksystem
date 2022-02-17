export interface SqlCheckerResult {
  id: string;
  taskNumber: number;
  statement: string;
  queryRight: boolean;
  parsable: boolean;
  tablesRight: boolean;
  attributesRight: boolean;
  whereAttributesRight: boolean;
  stringsRight: boolean;
  userId: number;
  attempt: number;
}
