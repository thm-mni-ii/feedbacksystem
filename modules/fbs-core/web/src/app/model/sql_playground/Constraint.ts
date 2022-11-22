export interface Constraint {
  table: string;
  constrains: [
    {
      name: string;
      type: string;
      columnName: string;
      checkClause: string;
    }
  ];
}
