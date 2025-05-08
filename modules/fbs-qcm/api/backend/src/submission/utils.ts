export interface Submission {
    _id: string,
    user: number,
    question: string,
    answer: any[],
    evaluation: any,
    timestamp: number,
    session: string
}

export interface FillInTheBlanksAnswer {
  text: string;
  order: number;
}
export interface FillInTheBlanksResponse {
  score: number;
  texts: FillInTheBlanksIndividual[];
}

export interface FillInTheBlanksIndividual {
  text: string;
  order: number;
  correct: boolean;
}

export interface entry {
  text: string;
  id: number;
}

export interface ChoiceAnswer {
  id: number;
  text: string;
  entries: entry[];
}

export interface entry {
  id: number;
  text: string;
}

export interface ChoiceReply {
  score: number;
  row: ChoiceReplyRow[];
}

export interface ChoiceReplyRow {
  id: number;
  text: string;
  entries: entry[];
  correct: number[];
}