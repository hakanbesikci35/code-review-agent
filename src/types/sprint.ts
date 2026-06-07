export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Sprint {
  id: string;
  name: string;
  branchName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  taskCount: number;
  completedTaskCount: number;
}
