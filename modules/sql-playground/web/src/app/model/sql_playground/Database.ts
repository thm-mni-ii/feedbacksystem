export interface Database {
  id: number | string;
  name: string;
  version: string;
  dbType: string;
  active: boolean;
}
