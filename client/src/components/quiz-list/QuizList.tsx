'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { QuizInterface } from "@/interfaces/Quiz";
import QuizItem from "./QuizItem";

export default function QuizList() {
    const [list, setList] = useState<QuizInterface[]>([]);
    const [quizFetched, setQuizFetched] = useState<number>(0);
    const [autoFetch, setAutoFetch] = useState<boolean>(false);
    const [allFetched, setAllFetched] = useState<boolean>(false);
    const [sortKey, setSortKey] = useState<'name' | 'questions' | 'completions'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/quiz/${quizFetched}`);
            const newQuizzes = res.data;

            if (newQuizzes.length === 0) {
                setAllFetched(true);
            } else {
                setAllFetched(false);
                const updatedList = quizFetched === 0 ? newQuizzes : [...list, ...newQuizzes];
                setList(updatedList);
                setQuizFetched(quizFetched + 5);
                await fetchCompletionCounts(updatedList);
            }
        } catch (error) {
            console.log("Error fetching quizzes:", error);
        }
    };

    const fetchCompletionCounts = async (quizzes: QuizInterface[]) => {
        try {
            const completionPromises = quizzes.map((quiz) =>
                axios.get(`${process.env.NEXT_PUBLIC_API}/completion/count/${quiz._id}`)
                    .then((response) => ({ _id: quiz._id, completions: response.data.count }))
                    .catch((err) => {
                        console.error(`Error fetching completions for quiz ${quiz._id}:`, err);
                        return { _id: quiz._id, completions: 0 };
                    })
            );

            const completionResults = await Promise.all(completionPromises);
            const updatedList = quizzes.map((quiz) => {
                const completionData = completionResults.find((result) => result._id === quiz._id);
                return { ...quiz, completions: completionData?.completions ?? 0 };
            });

            if (sortKey) {
                sortList(updatedList, sortKey, sortDirection);
            } else {
                setList(updatedList);
            }
        } catch (error) {
            console.error("Error fetching completion counts:", error);
        }
    };

    const sortList = (quizzes: QuizInterface[], key: 'name' | 'questions' | 'completions', direction: 'asc' | 'desc') => {
        const sortedList = [...quizzes].sort((a, b) => {
            let comparison = 0;
            if (key === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (key === 'questions') {
                comparison = a.questions.length - b.questions.length;
            } else if (key === 'completions') {
                comparison = (a.completions ?? 0) - (b.completions ?? 0);
            }
            return direction === 'asc' ? comparison : -comparison;
        });
        setList(sortedList);
    };

    const handleSort = (key: 'name' | 'questions' | 'completions') => {
        if (sortKey === key) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
            sortList(list, key, newDirection);
        } else {
            setSortKey(key);
            setSortDirection('asc');
            sortList(list, key, 'asc');
        }
    };

    const toggleAutoFetch = () => {
        setAutoFetch((prev) => !prev);
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        if (allFetched) {
            return;
        } else if (autoFetch) {
            const handleScroll = async () => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                    fetchQuizzes();
                }
            };

            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [quizFetched, autoFetch]);

    return (
        <div className="w-screen">
            <div className="w-full flex justify-center mb-7">
                <div className="w-full md:w-2/3 lg:w-1/2 flex gap-x-3">
                    <button
                        onClick={() => handleSort('name')}
                        className={`px-4 py-2 rounded-lg ${sortKey === 'name' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300'}`}
                    >
                        Name {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('questions')}
                        className={`px-4 py-2 rounded-lg ${sortKey === 'questions' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300'}`}
                    >
                        Questions {sortKey === 'questions' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('completions')}
                        className={`px-4 py-2 rounded-lg ${sortKey === 'completions' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300'}`}
                    >
                        Completions {sortKey === 'completions' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={toggleAutoFetch}
                        className={`px-4 py-2 rounded-lg ${autoFetch ? 'bg-green-600 text-white' : 'bg-slate-800 text-gray-300'}`}
                    >
                        Auto Fetch {autoFetch ? 'On' : 'Off'}
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col items-center">
                {list.map((quiz) => (
                    <QuizItem quiz={quiz} key={quiz._id} />
                ))}
                {allFetched ? null : !autoFetch ? (
                    <button
                        onClick={fetchQuizzes}
                        className="w-44 h-10 mb-10 mt-5 flex justify-center items-center bg-blue-600 rounded-lg"
                    >
                        Load More
                    </button>
                ) : null}
            </div>
        </div>
    );
}