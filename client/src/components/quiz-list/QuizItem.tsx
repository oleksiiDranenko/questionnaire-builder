'use client'

import { QuizInterface } from "@/interfaces/Quiz";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

interface PropsInterface {
    quiz: QuizInterface;
}

export default function QuizItem({ quiz }: PropsInterface) {
    const [completionCount, setCompletionCount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompletionCount = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/completion/count/${quiz._id}`);
                setCompletionCount(response.data.count);
            } catch (err) {
                setError("Failed to load completion count");
                console.error(err);
            }
        };

        fetchCompletionCount();
    }, [quiz._id]);

    return (
        <div className="w-screen flex justify-center mb-7">
            <div className="w-full md:w-2/3 lg:w-1/2 border border-slate-800 overflow-hidden rounded-lg">
                <div className="w-full flex p-3 justify-between items-center bg-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{quiz.name}</h1>
                        <div>
                            <span className="mr-2 text-sm text-blue-400">
                                {quiz.questions.length + (quiz.questions.length > 1 ? " questions" : " question")}
                            </span>
                            <span className="text-sm text-green-500">
                                {completionCount !== null
                                    ? `${completionCount} ${completionCount === 1 ? "completion" : "completions"}`
                                    : "Loading..."}
                                {error && <span className="text-red-500 ml-2">{error}</span>}
                            </span>
                        </div>
                    </div>
                    <Link
                        href={`/run-quiz/${quiz._id}`}
                        className="h-10 w-1/3 flex justify-center items-center transition bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                        Run Quiz
                    </Link>
                </div>
                <div className="p-3 font-light">{quiz.description}</div>
                <div className="p-3 flex justify-start items-center">
                    <Link
                        href={`/edit-quiz/${quiz._id}`}
                        className="h-10 w-1/3 flex justify-center items-center transition bg-slate-800 hover:bg-opacity-50 rounded-lg"
                    >
                        Edit Quiz
                    </Link>

                    <Link
                        href={`/quiz-statistics/${quiz._id}`}
                        className="h-10 ml-3 w-1/3 flex justify-center items-center transition bg-slate-800 hover:bg-opacity-50 rounded-lg"
                    >
                        Statistics
                    </Link>
                </div>
            </div>
        </div>
    );
}