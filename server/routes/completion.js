// quizRouter.js
import express from 'express';
import { QuizModel } from '../models/QuizModel.js'; 
import { QuizCompletionModel } from '../models/QuizCompletionModel.js'; 
import mongoose from 'mongoose';

const router = express.Router();


// GET
router.get('/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ message: 'Invalid quizId format' });
        }

        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const completions = await QuizCompletionModel.find({ quizId });
        res.status(200).json({ completions });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve completions', error });
    }
});

router.get('/count/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ message: 'Invalid quizId format' });
        }

        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const completionCount = await QuizCompletionModel.countDocuments({ quizId });
        res.status(200).json({ count: completionCount });
  } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve completion count', error });
  }
});

// POST
router.post('/complete', async (req, res) => {
    const { quizId, responses, timeTaken } = req.body;
  
    try {
      
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ message: 'Invalid quizId format' });
        }
  
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
  
        const completion = new QuizCompletionModel({
            quizId,
            responses,
            timeTaken,
        });
  
        await completion.save();
        res.status(201).json({ completion });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save quiz completion', error });
    }
  });

export { router as completionRouter };