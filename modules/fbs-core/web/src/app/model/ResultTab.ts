import { MatLegacyTableDataSource as MatTableDataSource } from "@angular/material/legacy-table";

export interface ResultTab {
  id: number;
  name: string;
  error?: boolean;
  errorMsg?: string;
  dataSource?: MatTableDataSource<string[]>;
  displayedColumns?: string[];
}
