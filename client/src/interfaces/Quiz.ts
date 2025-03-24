export interface OptionInterface {
    id: number;
    text: string;
}

export interface QuestionInterface {
    questionId: number;
    question: string;
    type: 'text' | 'single' | 'multiple';
    answer?: string;
    options?: OptionInterface[];
    correctOption?: number;
    correctOptions?: number[];
}

export interface QuizInterface {
    _id?: string,
    name: string;
    description: string;
    questions: QuestionInterface[];
    completions?: number
}