interface Submission {
    _id: string,
    user: number,
    question: string,
    answer: any[],
    evaluation: any,
    timestamp: number,
    session: string
}