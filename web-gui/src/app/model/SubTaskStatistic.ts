export interface SubTaskStatistic {
  taskId: number;
  name: string;
  subtasks: {
    name: String
    avgPoints: number;
    maxPoints: number;
  }[];
}
