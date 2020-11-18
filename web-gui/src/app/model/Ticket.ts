import {User} from './User';

export interface Ticket {
  id: number;
  desc: string;
  courseId: number;
  priority: number;
  status: string;
  timestamp: number;
  assignee: User;
  creator: User;
  queuePosition?: number;
}
