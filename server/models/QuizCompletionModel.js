import mongoose from 'mongoose';
import { Schema } from 'mongoose'

const quizCompletionSchema = new Schema({
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    responses: [{
        questionId: { type: Number, required: true },
        answer: { type: Schema.Types.Mixed, required: true },
    }],
    timeTaken: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
});
  
export const QuizCompletionModel = mongoose.model('QuizCompletion', quizCompletionSchema);