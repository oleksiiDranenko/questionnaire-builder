'use client'

import { useEffect, useState, useCallback } from "react"
import { QuizInterface, QuestionInterface, OptionInterface } from "@/interfaces/Quiz"
import QuizQuestion from "../quiz-form/QuizQuestion"
import axios from "axios"
import { useRouter, useParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

export default function EditQuizForm() {
    const [name, setName] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [questionsList, setQuestionsList] = useState<QuestionInterface[]>([])
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    
    const router = useRouter()
    const params = useParams()
    const quizId = params.id 

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) return
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/quiz/get-one/${quizId}`)
                const quiz: QuizInterface = response.data
                setName(quiz.name)
                setDescription(quiz.description)
                setQuestionsList(quiz.questions)
                setLoading(false)
            } catch (error) {
                setErrorMessage("Failed to load quiz. Please try again.")
                setLoading(false)
            }
        }
        fetchQuiz()
    }, [quizId])

    const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value)
    }

    const addQuestion = () => {
        const highestId = questionsList.length > 0 
            ? Math.max(...questionsList.map(q => q.questionId))
            : 0
        const newQuestion = {
            questionId: highestId + 1, // Stable, unique ID
            question: '',
            type: 'text' as const,
            answer: '',
        }
        setQuestionsList(prev => [...prev, newQuestion])
    }

    const removeQuestion = (questionId: number) => {
        setQuestionsList(prev => prev.filter(question => question.questionId !== questionId))
    }

    const updateQuestionType = (questionId: number, newType: 'text' | 'single' | 'multiple') => {
        setQuestionsList(prevQuestions => {
            return prevQuestions.map((question) => {
                if (question.questionId === questionId) {
                    const updatedQuestion: QuestionInterface = {
                        ...question,
                        type: newType,
                        question: question.question || '',
                        answer: newType === 'text' ? (question.answer || '') : undefined,
                        options: newType !== 'text' ? (question.options || [{ id: 1, text: '' }]) : undefined,
                        correctOption: newType === 'single' ? question.correctOption : undefined,
                        correctOptions: newType === 'multiple' ? (question.correctOptions || []) : undefined,
                    }
                    return updatedQuestion
                }
                return { ...question }
            })
        })
    }

    const updateQuestionOptions = (questionId: number, options: OptionInterface[]) => {
        setQuestionsList(prev => prev.map(question =>
            question.questionId === questionId ? { ...question, options } : { ...question }
        ))
    }
    
    const updateQuestionText = (questionId: number, text: string) => {
        setQuestionsList(prev => prev.map(question =>
            question.questionId === questionId ? { ...question, question: text } : { ...question }
        ))
    }

    const updateQuestionAnswer = (questionId: number, answer: string) => {
        setQuestionsList(prev => prev.map(question =>
            question.questionId === questionId ? { ...question, answer } : { ...question }
        ))
    }

    const updateCorrectOption = (questionId: number, correctOption?: number) => {
        setQuestionsList(prev => prev.map(question =>
            question.questionId === questionId ? { ...question, correctOption } : { ...question }
        ))
    }

    const updateCorrectOptions = (questionId: number, correctOptions?: number[]) => {
        setQuestionsList(prev => prev.map(question =>
            question.questionId === questionId ? { ...question, correctOptions } : { ...question }
        ))
    }

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setErrorMessage("Quiz name cannot be empty")
            return false
        }
        if (!description.trim()) {
            setErrorMessage("Description cannot be empty")
            return false
        }

        if (questionsList.length === 0) {
            setErrorMessage("Quiz must have at least one question")
            return false
        }

        let isValid = true;
        questionsList.forEach((question, index) => {
            if (!question.question.trim()) {
                setErrorMessage(`Question ${index + 1} text cannot be empty`)
                isValid = false
                return;
            }

            if (question.type === 'text') {
                if (!question.answer?.trim()) {
                    setErrorMessage(`Answer for question ${index + 1} cannot be empty`)
                    isValid = false
                    return;
                }
            } else {
                if (!question.options || question.options.length === 0) {
                    setErrorMessage(`Question ${index + 1} must have at least one option`)
                    isValid = false
                    return;
                }

                for (const option of question.options) {
                    if (!option.text.trim()) {
                        setErrorMessage(`Option text for question ${index + 1} cannot be empty`)
                        isValid = false
                        return;
                    }
                }

                if (question.type === 'single') {
                    if (question.correctOption === undefined) {
                        setErrorMessage(`Question ${index + 1} (single choice) must have one correct option selected`)
                        isValid = false
                        return;
                    }
                } else if (question.type === 'multiple') {
                    if (!question.correctOptions || question.correctOptions.length === 0) {
                        setErrorMessage(`Question ${index + 1} (multiple choice) must have at least one correct option selected`)
                        isValid = false
                        return;
                    }
                }
            }
        });

        if (!isValid) return false;

        setErrorMessage('')
        return true
    }

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        const reorderedQuestions = Array.from(questionsList)
        const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1)
        reorderedQuestions.splice(result.destination.index, 0, movedQuestion)

        setQuestionsList(reorderedQuestions)
    }, [questionsList])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            const quizData: QuizInterface = {
                name,
                description,
                questions: questionsList
            }
            try {
                const response = await axios.patch(`${process.env.NEXT_PUBLIC_API}/quiz/update/${quizId}`, quizData)
                setErrorMessage('Quiz successfully updated!')
                router.push('/')
            } catch (error) {
                setErrorMessage("Failed to update quiz. Please try again.")
            }
        }
    }

    const handleDelete = async () => {
        if (!quizId) return;

        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API}/quiz/delete/${quizId}`)
            setErrorMessage('Quiz deleted successfully!')
            router.push('/')
        } catch (error: any) {
            setErrorMessage(
                error.response?.data?.message || "Failed to delete quiz. Please try again."
            )
        }
    }

    if (loading) {
        return (
            <div className="w-screen flex flex-col items-center">
                <div className="w-full md:w-2/3 lg:w-1/2 p-3">
                    <p>Loading quiz...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-screen flex flex-col items-center">
            <div className="w-full md:w-2/3 lg:w-1/2 border border-slate-800 rounded-lg overflow-hidden">
                <h1 className="w-full h-14 flex justify-center items-center bg-slate-800 text-xl font-bold">
                    Edit Quiz
                </h1>

                <form onSubmit={handleSubmit} className="w-full p-3">
                    {errorMessage && (
                        <div className={`w-full p-3 mt-3 flex justify-start items-center rounded-lg mb-4 bg-red-600 bg-opacity-40`}>
                            {errorMessage}
                        </div>
                    )}
                    <div className="mb-5 mt-2">
                        <h2 className="text-lg font-bold mb-3">
                            Quiz Name
                        </h2>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-[#111827] border border-slate-800 rounded-lg focus:bg-slate-800 outline-none"
                            value={name}
                            onChange={handleName}
                        />
                    </div>
                    <div className="mb-5">
                        <h2 className="text-lg font-bold mb-3">
                            Description
                        </h2>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-[#111827] border border-slate-800 rounded-lg focus:bg-slate-800 outline-none"
                            value={description}
                            onChange={handleDescription}
                        />
                    </div>
                    
                    <div className="mb-10">
                        <h2 className="text-lg font-bold mb-3">
                            Questions
                        </h2>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="questions">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className=""
                                    >
                                        {questionsList.map((question, index) => (
                                            <Draggable
                                                key={question.questionId.toString()}
                                                draggableId={question.questionId.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="mb-4"
                                                    >
                                                        <QuizQuestion
                                                            removeQuestion={removeQuestion}
                                                            question={question}
                                                            index={index}
                                                            updateQuestionText={updateQuestionText}
                                                            updateQuestionType={updateQuestionType}
                                                            updateQuestionOptions={updateQuestionOptions}
                                                            updateQuestionAnswer={updateQuestionAnswer}
                                                            updateCorrectOption={updateCorrectOption}
                                                            updateCorrectOptions={updateCorrectOptions}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <button 
                            type="button"
                            className="w-1/3 h-10 bg-slate-800 rounded-lg"
                            onClick={addQuestion}
                        >
                            + Add Question
                        </button>
                    </div>
                   
                    <div className="w-full gap-x-3 flex justify-between items-center">
                        <button 
                            type="submit"
                            className="w-1/2 h-10 bg-blue-600 focus:bg-opacity-50 rounded-lg"
                        >
                            Update Quiz
                        </button>

                        <button 
                            type="button"
                            className="w-1/2 h-10 bg-red-600 focus:bg-opacity-50 rounded-lg"
                            onClick={handleDelete}
                        >
                            Delete Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}