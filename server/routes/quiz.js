import express from "express";
import { QuizModel } from "../models/QuizModel.js";


const router = express.Router();


// GET

router.get('/:itemsSkip', async (req, res) => {

    const itemsSkip = parseInt(req.params.itemsSkip, 10) || 0;

    try {

        const quizList = await QuizModel.find().skip(itemsSkip).limit(5)

        res.status(200).json(quizList)
        
    } catch (error) {
        res.status(404).json({
            message: 'Unable to get quizzes',
            error
        })
    }
});

router.get('/get-one/:quizId', async (req, res) => {
    const {quizId} = req.params

    try {

        const quiz = await QuizModel.findById(quizId)
        res.status(200).json(quiz)
        
    } catch (error) {
        res.status(404).json({
            message: 'No quiz found with the given ID',
            error
        })
    }
})



// POST

router.post('/add', async (req, res) => {
    try {
        const { name, description, questions } = req.body;

        if (!name || !description || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ 
                message: 'Invalid quiz data' 
            });
        }

        const newQuiz = new QuizModel({ name, description, questions });

        await newQuiz.save();
        res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ 
            message: 'Unable to add quiz',
            error
        });
    }
});


// PATCH

router.patch('/update/:quizId', async (req, res) => {

    const {quizId} = req.params;
    const updatedData = req.body;

    try {

        const updatedQuiz = await QuizModel.findByIdAndUpdate(quizId, updatedData,{ new: true })

        if (!updatedQuiz) {
            return res.status(404).json({ 
                message: 'Quiz not found' 
            });
        }

        res.status(200).json(updatedQuiz)
        
    } catch (error) {
        res.status(500).json({ 
            message: 'Unable to update quiz',
            error
        });
    }
})


// DELETE
router.delete('/delete/:quizId', async (req, res) => {
    const { quizId } = req.params; 

    try {

        const deletedQuiz = await QuizModel.findByIdAndDelete(quizId);

        if (!deletedQuiz) {
            return res.status(404).json({
                message: 'Quiz not found'
            });
        }

        res.status(200).json({
            message: 'Quiz deleted successfully'
        });
        
    } catch (error) {
        res.status(500).json({ 
            message: 'Unable to delete quiz',
            error
        });
    }
});



export { router as quizRouter };
