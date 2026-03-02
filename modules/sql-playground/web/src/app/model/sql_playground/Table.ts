import { Constraint } from "./Constraint";

export interface Table {
  name: string;
  columns: [
    {
      name: string;
      udtName: string;
      isNullable: boolean;
      isPrimaryKey: boolean;
    }
  ];
  constraints: Constraint;
}
