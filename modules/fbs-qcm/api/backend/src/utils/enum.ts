
export enum AnswerScore {
    correct = "TRUE",
    partial = "PARTIAL",
    incorrect = "FALSE"
}

export enum SessionStatus {
    ongoing = 0,
    paused = 1,
    finished = 2
}

export enum Access {
    student = 0,
    tutorInCourse = 1,
    moderator = 2,
    admin = 3
}