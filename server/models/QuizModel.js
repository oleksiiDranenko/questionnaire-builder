import { Schema } from "mongoose";
import mongoose from "mongoose";

const OptionSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  text: {
    type: String, 
    required: true
  }
});


const QuestionSchema = new Schema({
  questionId: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'single', 'multiple'],
    required: true
  },
  answer: {
    type: String,
    required: function() {
      return this.type === 'text';  // Required only if type is "text"
    }
  },
  options: {
    type: [OptionSchema],  // Array of options for "single" or "multiple"
    required: function() {
      return this.type === 'single' || this.type === 'multiple';  // Required for choice questions
    }
  },
  correctOption: {
    type: Number,  
    required: function() {
      return this.type === 'single';  // Required only if type is "single"
    }
  },
  correctOptions: {
    type: [Number], 
    required: function() {
      return this.type === 'multiple';  // Required only if type is "multiple"
    }
  }
});


const QuizSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  questions: {
    type: [QuestionSchema],
    required: true,
  }
});


export const QuizModel = mongoose.model('quizzes', QuizSchema);
