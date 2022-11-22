import { Constraint } from "./Constraint";

export interface Table {
  table_name: string;
  columns: [
    {
      columnName: string;
      udtName: string;
      nullable: boolean;
      isPrimaryKey: boolean;
    }
  ];
  constraints: Constraint;
}
