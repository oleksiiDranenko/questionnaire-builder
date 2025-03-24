'use client'

import { OptionInterface, QuestionInterface } from "@/interfaces/Quiz"
import { useState, useEffect } from "react"

interface PropsInterface {
    removeQuestion: (id: number) => void,
    question: QuestionInterface,
    index: number,
    updateQuestionText: (questionId: number, text: string) => void,
    updateQuestionType: (questionId: number, newType: 'text' | 'single' | 'multiple') => void,
    updateQuestionOptions: (questionId: number, options: OptionInterface[]) => void,
    updateQuestionAnswer: (questionId: number, answer: string) => void,
    updateCorrectOption?: (questionId: number, correctOption?: number) => void,
    updateCorrectOptions?: (questionId: number, correctOptions?: number[]) => void
}

export default function QuizQuestion({removeQuestion, question, index, updateQuestionText, updateQuestionType, updateQuestionOptions, updateQuestionAnswer, updateCorrectOption, updateCorrectOptions} : PropsInterface) {
    const [questionText, setQuestionText] = useState<string>(question.question || '')
    const [options, setOptions] = useState<OptionInterface[]>(question.options || [{id: 1, text: ''}])
    const [answer, setAnswer] = useState<string>(question.answer || '')
    const [correctOption, setCorrectOption] = useState<number | undefined>(question.correctOption)
    const [correctOptions, setCorrectOptions] = useState<number[]>(question.correctOptions || [])

    useEffect(() => {
        setQuestionText(question.question || '')
        setOptions(question.options || [{id: 1, text: ''}])
        setAnswer(question.answer || '')
        setCorrectOption(question.correctOption)
        setCorrectOptions(question.correctOptions || [])
    }, [question.question, question.options, question.answer, question.correctOption, question.correctOptions, question.type])

    const handleQuestionText = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value
        setQuestionText(newText)
        updateQuestionText(question.questionId, newText)
    }

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAnswer = e.target.value
        setAnswer(newAnswer)
        updateQuestionAnswer(question.questionId, newAnswer)
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as 'text' | 'single' | 'multiple'
        updateQuestionType(question.questionId, newType)

        if (newType === 'text') {
            setOptions([{id: 1, text: ''}])
            updateQuestionOptions(question.questionId, [{id: 1, text: ''}])
            setCorrectOption(undefined)
            setCorrectOptions([])
            updateCorrectOption?.(question.questionId, undefined)
            updateCorrectOptions?.(question.questionId, [])
        } else {
            setAnswer('')
            updateQuestionAnswer(question.questionId, '')
            setCorrectOption(undefined)
            setCorrectOptions([])
            updateCorrectOption?.(question.questionId, undefined)
            updateCorrectOptions?.(question.questionId, [])
        }
    }

    const handleOptionChange = (id: number, newText: string) => {
        const updatedOptions = options.map((option) =>
            option.id === id ? { ...option, text: newText } : option
        )
        setOptions(updatedOptions)
        updateQuestionOptions(question.questionId, updatedOptions)
    }

    const addOption = () => {
        const newOption = {
            id: options.length + 1,
            text: ''
        }
        const updatedOptions = [...options, newOption]
        setOptions(updatedOptions)
        updateQuestionOptions(question.questionId, updatedOptions)
    }

    const removeOption = (optionId: number) => {
        if (options.length <= 1) return;

        const updatedOptions = options
            .filter(option => option.id !== optionId)
            .map((option, index) => ({
                ...option,
                id: index + 1
            }))
        setOptions(updatedOptions)
        updateQuestionOptions(question.questionId, updatedOptions)

        if (question.type === 'single' && correctOption === optionId) {
            setCorrectOption(undefined)
            updateCorrectOption?.(question.questionId, undefined)
        } else if (question.type === 'multiple') {
            const updatedCorrectOptions = correctOptions
                .filter(id => id !== optionId)
                .map(id => id > optionId ? id - 1 : id)
            setCorrectOptions(updatedCorrectOptions)
            updateCorrectOptions?.(question.questionId, updatedCorrectOptions)
        }
    }

    const handleCorrectToggle = (optionId: number) => {
        if (question.type === 'single') {
            const newCorrectOption = correctOption === optionId ? undefined : optionId
            setCorrectOption(newCorrectOption)
            updateCorrectOption?.(question.questionId, newCorrectOption)
        } else if (question.type === 'multiple') {
            const newCorrectOptions = correctOptions.includes(optionId)
                ? correctOptions.filter(id => id !== optionId)
                : [...correctOptions, optionId]
            setCorrectOptions(newCorrectOptions)
            updateCorrectOptions?.(question.questionId, newCorrectOptions)
        }
    }

    return (
        <div className="mb-10">
            <div className="mb-5 flex flex-row items-center justify-between">
                <span className="cursor-move">
                    ☰ {index + 1}
                </span>
                <input 
                    type="text" 
                    className="w-3/6 p-3 bg-[#111827] border border-slate-800 rounded-lg focus:bg-slate-800 outline-none"
                    value={questionText}
                    onChange={handleQuestionText}
                />
                <span>
                    Type 
                </span>
                <select 
                    value={question.type}
                    onChange={handleTypeChange}
                    className="w-1/6 p-3 bg-[#111827] border border-slate-800 rounded-lg focus:bg-slate-800 outline-none"
                >
                    <option value="text">text</option>
                    <option value="single">single choice</option>
                    <option value="multiple">multiple choice</option>
                </select>
                <button 
                    className="w-1/6 py-3 border border-slate-800 rounded-lg text-red-600"
                    onClick={() => removeQuestion(question.questionId)}
                >
                    Remove
                </button>
            </div>
            {question.type === 'text' ? (
                <div className="pl-16">
                    <h3 className="text-lg font-bold mb-3">
                        Answer
                    </h3>
                    <div className="flex flex-row items-center justify-between">
                        <input 
                            type="text" 
                            className="w-full p-3 bg-[#111827] border border-slate-800 rounded-lg focus:bg-slate-800 outline-none"
                            value={answer}
                            onChange={handleAnswerChange}
                        />
                    </div>
                </div>
            ) : (
                <div className="pl-16">
                    <h3 className="text-lg font-bold mb-3">
                        Options
                    </h3>
                    <div>
                        {options.map((option) => (
                            <div key={option.id} className="mb-5 flex flex-row items-center justify-between">
                                <span>{option.id}</span>
                                <input 
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                    className="w-1/2 p-3 ml-3 mr-3 bg-[#111827] border border-slate-800 rounded-lg focus:bg-slate-800 outline-none"
                                />
                                <button 
                                    className="w-1/6 py-3 mr-3 border border-slate-800 rounded-lg text-red-600"
                                    onClick={() => removeOption(option.id)}
                                    disabled={options.length <= 1}
                                >
                                    Remove
                                </button>
                                <span>Correct:</span>
                                <button
                                    type="button"
                                    className={`w-10 h-10 ml-3 border border-slate-800 rounded-full transition-all ${
                                        (question.type === 'single' && correctOption === option.id) ||
                                        (question.type === 'multiple' && correctOptions.includes(option.id))
                                            ? 'bg-green-500'
                                            : 'bg-gray-500'
                                    }`}
                                    onClick={() => handleCorrectToggle(option.id)}
                                ></button>
                            </div>
                        ))}
                    </div>
                    <button 
                        className="w-1/3 h-10 bg-slate-800 rounded-lg"
                        onClick={addOption}
                    >
                        + Add Option
                    </button>
                </div>
            )}
        </div>
    )
}