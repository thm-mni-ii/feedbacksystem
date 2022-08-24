export interface SqlCheckerResult {
  _id: string;
  id: string;
  taskNumber: number;
  statement: string;
  queryRight: boolean;
  parsable: boolean;
  tablesRight: boolean;
  stringsRight: boolean;
  userId: number;
  attempt: number;
  proAttributesRight: boolean;
  selAttributesRight: boolean;
}
