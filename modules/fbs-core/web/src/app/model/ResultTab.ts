import { MatTableDataSource } from "@angular/material/table";

export interface ResultTab {
  id: number;
  name: string;
  error?: boolean;
  errorMsg?: string;
  dataSource?: MatTableDataSource<string[]>;
  displayedColumns?: string[];
}
