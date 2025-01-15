export interface ResultTab {
  id: string;
  name: string;
  error?: boolean;
  errorMsg?: string;
  resultset?: any;
  displayedColumns?: string[];
}
