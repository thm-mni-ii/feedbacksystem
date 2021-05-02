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
  } | {
    inputs: string[][],
    outputs: string[],
  };
}
