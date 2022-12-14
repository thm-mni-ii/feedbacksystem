export interface SQLResponse {
  error: boolean;
  errorMsg: string;
  result: ResponseTable[];
}

interface ResponseTable {
  head: string[];
  rows: string[];
}
