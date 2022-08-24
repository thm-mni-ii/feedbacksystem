export interface SubTaskStatistic {
  taskID: number;
  name: string;
  subtasks: {
    name: String;
    avgPoints: number;
    maxPoints: number;
  }[];
}
