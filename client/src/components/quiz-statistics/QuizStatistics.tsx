'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { QuizInterface, QuestionInterface, OptionInterface } from "@/interfaces/Quiz";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface QuizCompletion {
    _id?: string;
    quizId: string;
    responses: { questionId: number; answer: string | number | number[] }[];
    timeTaken: number;
    completedAt: Date;
}

export default function QuizStatistics() {
    const [quiz, setQuiz] = useState<QuizInterface | null>(null);
    const [completions, setCompletions] = useState<QuizCompletion[]>([]);
    const [avgTime, setAvgTime] = useState<number>(0);
    const [completionsPerDay, setCompletionsPerDay] = useState<{ [key: string]: number }>({});
    const [avgCorrect, setAvgCorrect] = useState<number>(0);
    const [error, setError] = useState<string>('');

    const params = useParams();
    const quizId = params.id as string;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quizResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/quiz/get-one/${quizId}`);
                setQuiz(quizResponse.data);

                const completionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/completion/${quizId}`);
                setCompletions(completionsResponse.data.completions);

                const completionsData = completionsResponse.data.completions as QuizCompletion[];
                if (completionsData.length > 0) {
                    const totalTime = completionsData.reduce((sum, comp) => sum + comp.timeTaken, 0);
                    setAvgTime(totalTime / completionsData.length);

                    const dailyCounts: { [key: string]: number } = {};
                    completionsData.forEach(comp => {
                        const date = new Date(comp.completedAt).toLocaleDateString();
                        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
                    });
                    setCompletionsPerDay(dailyCounts);

                    let totalCorrect = 0;
                    completionsData.forEach(comp => {
                        let correctCount = 0;
                        const quizQuestions = quizResponse.data.questions as QuestionInterface[];
                        comp.responses.forEach(resp => {
                            const question = quizQuestions.find(q => q.questionId === resp.questionId);
                            if (question) {
                                if (question.type === 'text') {
                                    if (String(resp.answer).toLowerCase().trim() === question.answer?.toLowerCase().trim()) {
                                        correctCount++;
                                    }
                                } else if (question.type === 'single') {
                                    if (resp.answer === question.correctOption) {
                                        correctCount++;
                                    }
                                } else {
                                    const userArray = (resp.answer as number[]) || [];
                                    const correctArray = question.correctOptions || [];
                                    if (
                                        userArray.length === correctArray.length &&
                                        userArray.every(id => correctArray.includes(id)) &&
                                        correctArray.every(id => userArray.includes(id))
                                    ) {
                                        correctCount++;
                                    }
                                }
                            }
                        });
                        totalCorrect += correctCount / quizQuestions.length;
                    });
                    setAvgCorrect(totalCorrect / completionsData.length);
                }
            } catch (err) {
                setError("Failed to load quiz statistics");
            }
        };
        fetchData();
    }, [quizId]);

    const formatTime = (seconds: number): string => {
        const roundedSeconds = Math.round(seconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const remainingSeconds = roundedSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const chartData = {
        labels: Object.keys(completionsPerDay),
        datasets: [{
            label: 'Completions',
            data: Object.values(completionsPerDay),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Completions',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Completions Per Day',
            },
        },
    };

    if (!quiz) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 text-center">
                {error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <p>Loading statistics...</p>
                )}
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2 border border-slate-800 overflow-hidden rounded-lg">
                <h1 className="w-full h-16 flex justify-center items-center bg-slate-800 text-2xl font-bold mb-4">
                    {quiz.name} Statistics
                </h1>
                <div className="p-3">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">Average Completion Time</h2>
                        <p>{completions.length > 0 ? formatTime(avgTime) : "No completions yet"}</p>
                    </div>
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Completions Per Day</h2>
                        {completions.length > 0 ? (
                            <Bar data={chartData} options={chartOptions} />
                        ) : (
                            <p>No completions yet</p>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Average Correct Answers</h2>
                        <p>{completions.length > 0 ? `${(avgCorrect * 100).toFixed(1)}% (${Math.round(avgCorrect * quiz.questions.length)}/${quiz.questions.length})` : "No completions yet"}</p>
                    </div>
                    {error && (
                        <p className="text-red-600 mt-4">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}