'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface Option {
    id: number;
    text: string;
}

interface Question {
    questionId: number;
    question: string;
    type: 'text' | 'single' | 'multiple';
    answer?: string;
    options?: Option[];
    correctOption?: number;
    correctOptions?: number[];
}

interface Quiz {
    name: string;
    description: string;
    questions: Question[];
}

export default function QuizRunForm() {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [responses, setResponses] = useState<{ [key: number]: string | number | number[] }>({});
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [timeTaken, setTimeTaken] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const params = useParams();
    const quizId = params.id as string;

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/quiz/get-one/${quizId}`);
                setQuiz(response.data);
                const start = Date.now();
                setStartTime(start);
            } catch (error) {
                setErrorMessage("Failed to load quiz. Please try again.");
            }
        };
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (!startTime || submitted) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const secondsElapsed = Math.round((now - startTime) / 1000);
            setElapsedTime(secondsElapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, submitted]);

    const handleResponseChange = (questionId: number, value: string | number | number[]) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !quiz) return;

        const endTime = Date.now();
        const timeTakenSeconds = Math.round((endTime - startTime) / 1000);

        const completionData = {
            quizId,
            responses: quiz.questions.map(q => ({
                questionId: q.questionId,
                answer: responses[q.questionId] ?? (q.type === 'text' ? '' : q.type === 'single' ? null : []),
            })),
            timeTaken: timeTakenSeconds,
        };

        try {
            console.log("Submitting completion data:", completionData);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/completion/complete`, completionData);
            console.log("Submission response:", response.data);
            setTimeTaken(timeTakenSeconds);
            setSubmitted(true);
        } catch (error: any) {
            console.error("Submission error:", error.response?.data || error.message);
            setErrorMessage("Failed to submit quiz. Please try again.");
        }
    };

    if (!quiz) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 text-center">
                {errorMessage ? (
                    <p className="text-red-600">{errorMessage}</p>
                ) : (
                    <p>Loading quiz...</p>
                )}
            </div>
        );
    }

    if (submitted) {
        let correctCount = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question) => {
            const userAnswer = responses[question.questionId];
            if (question.type === 'text') {
                if (userAnswer && String(userAnswer).toLowerCase().trim() === question.answer?.toLowerCase().trim()) {
                    correctCount++;
                }
            } else if (question.type === 'single') {
                if (userAnswer === question.correctOption) {
                    correctCount++;
                }
            } else {
                const userArray = (userAnswer as number[]) || [];
                const correctArray = question.correctOptions || [];
                if (
                    userArray.length === correctArray.length &&
                    userArray.every(id => correctArray.includes(id)) &&
                    correctArray.every(id => userArray.includes(id))
                ) {
                    correctCount++;
                }
            }
        });

        return (
            <div className="w-full max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 text-green-400">
                    🎉 Quiz Completed!
                </h1>
                <p className="mb-5">
                    Time Taken: {timeTaken} seconds
                </p>
                <p className="mb-5">
                    Score: {correctCount}/{totalQuestions} correct
                </p>
                <h2 className="text-lg font-bold mb-5">Your Answers:</h2>
                <ul className="space-y-4">
                    {quiz.questions.map((question) => {
                        const userAnswer = responses[question.questionId];
                        let displayUserAnswer: string;
                        let displayCorrectAnswer: string;
                        let isCorrect: boolean;

                        if (question.type === 'text') {
                            displayUserAnswer = userAnswer ? String(userAnswer) : 'Not answered';
                            displayCorrectAnswer = question.answer || 'N/A';
                            isCorrect = !!userAnswer && String(userAnswer).toLowerCase().trim() === question.answer?.toLowerCase().trim();
                        } else if (question.type === 'single') {
                            const option = question.options?.find(opt => opt.id === userAnswer);
                            displayUserAnswer = option ? option.text : 'Not answered';
                            const correctOption = question.options?.find(opt => opt.id === question.correctOption);
                            displayCorrectAnswer = correctOption ? correctOption.text : 'N/A';
                            isCorrect = userAnswer === question.correctOption;
                        } else {
                            const answers = (userAnswer as number[])?.map(id => {
                                const option = question.options?.find(opt => opt.id === id);
                                return option ? option.text : 'Unknown';
                            });
                            displayUserAnswer = answers?.length ? answers.join(', ') : 'Not answered';
                            const correctAnswers = question.correctOptions?.map(id => {
                                const option = question.options?.find(opt => opt.id === id);
                                return option ? option.text : 'Unknown';
                            });
                            displayCorrectAnswer = correctAnswers?.length ? correctAnswers.join(', ') : 'N/A';
                            const userArray = (userAnswer as number[]) || [];
                            const correctArray = question.correctOptions || [];
                            isCorrect =
                                userArray.length === correctArray.length &&
                                userArray.every(id => correctArray.includes(id)) &&
                                correctArray.every(id => userArray.includes(id));
                        }

                        return (
                            <div className="bg-slate-800 p-3 rounded-lg" key={question.questionId}>
                                <p className="font-bold mb-1">
                                    {question.question}
                                </p>
                                <p className={`mb-1 font ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    Your Answer: {displayUserAnswer}
                                </p>
                                <p className="">
                                    Correct Answer: {displayCorrectAnswer}
                                </p>
                            </div>
                        );
                    })}
                </ul>
                <button
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => window.location.href = '/'}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className='w-screen flex justify-center mb-7'>
            <div className="w-full md:w-2/3 lg:w-1/2 border border-slate-800 overflow-hidden rounded-lg">
                <div className="w-full flex p-3 justify-between items-center bg-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{quiz.name}</h1>
                        <p>{quiz.description}</p>
                    </div>
                    <p className="h-14 px-3 flex justify-center items-center font-bold bg-blue-600 rounded-lg">
                        Time: {formatTime(elapsedTime)}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-3">
                    {quiz.questions.map((question) => (
                        <div key={question.questionId} className="mb-5">
                            <p className="text-lg font-bold mb-3">
                                {`${quiz.questions.indexOf(question) + 1}. ${question.question}`}
                            </p>
                            {question.type === 'text' ? (
                                <input
                                    type="text"
                                    value={(responses[question.questionId] as string) || ''}
                                    onChange={(e) => handleResponseChange(question.questionId, e.target.value)}
                                    className="w-full p-2 bg-[#111827] border border-slate-800 rounded-lg focus:outline-none focus:bg-slate-800"
                                    placeholder="Type your answer here"
                                />
                            ) : question.type === 'single' ? (
                                <div className="ml-5">
                                    {question.options?.map((option) => (
                                        <label key={option.id} className="flex items-center mb-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`question-${question.questionId}`}
                                                value={option.id}
                                                checked={responses[question.questionId] === option.id}
                                                onChange={() => handleResponseChange(question.questionId, option.id)}
                                                className="hidden peer"
                                            />
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                                            <span className="ml-2">{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="ml-5">
                                    {question.options?.map((option) => (
                                        <label key={option.id} className="flex items-center mb-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={option.id}
                                                checked={(responses[question.questionId] as number[])?.includes(option.id) || false}
                                                onChange={(e) => {
                                                    const current = (responses[question.questionId] as number[]) || [];
                                                    const updated = e.target.checked
                                                        ? [...current, option.id]
                                                        : current.filter(id => id !== option.id);
                                                    handleResponseChange(question.questionId, updated);
                                                }}
                                                className="hidden peer"
                                            />
                                            <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                                            <span className="ml-2">{option.text}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Submit Quiz
                    </button>
                    {errorMessage && (
                        <p className="w-full flex justify-center text-red-600 mt-4">{errorMessage}</p>
                    )}
                </form>
            </div>
        </div>
    );
}