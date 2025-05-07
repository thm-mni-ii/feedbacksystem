import { Question } from "./Question";

export interface LearningSession {
    SessionId: string,
    dueDateCorrect: number,
    dueDatePartial: number,
    dueDateIncorrect: number,
    schedule: Schedule,
    Queue: Question[],
    maxQueueLength: number,
    RandomNewQuestionPosition: number,
    RandomNewQuestionSeed: number,
    isPublic: boolean
}

interface Schedule {
  [key: string]: string;
}