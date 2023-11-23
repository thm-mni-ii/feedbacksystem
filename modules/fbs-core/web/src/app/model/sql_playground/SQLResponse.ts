export interface SQLResponse {
  error: boolean;
  errorMsg: string;
  result: ResponseTable[];
}

interface ResponseTable {
  head: string[];
  rows: string[];
}

export interface SQLPlaygroundShare {
  url: string;
}
