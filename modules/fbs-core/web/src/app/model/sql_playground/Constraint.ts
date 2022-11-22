export interface Constraint {
  table_name: string;
  constrains: [
    {
      constraintName: string;
      constraintType: string;
      columnName: string;
      checkClause: string;
    }
  ];
}
