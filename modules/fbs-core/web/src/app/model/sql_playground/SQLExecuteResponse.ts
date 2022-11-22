import { Database } from "./Database";

export interface SQLExecuteResponse {
  id: number;
  statement: string;
  runIn: Database;
}
