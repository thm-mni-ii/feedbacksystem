export interface Task {
  id?: number;
  name: string;
  description?: string;
  deadline: string;
  mediaType?: string;
  mediaInformation?: {
    idField: string;
    inputFields: string;
    outputFields: string;
    decimals: number;
  } | {
    inputs: string[][],
    outputs: string[],
    decimals: number,
  };
}
