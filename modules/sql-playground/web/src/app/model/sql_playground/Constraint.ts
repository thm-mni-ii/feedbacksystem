export interface Constraint {
  table: string;
  constraints: [
    {
      name: string;
      type: string;
      columnName: string;
      checkClause: string;
    }
  ];
}
