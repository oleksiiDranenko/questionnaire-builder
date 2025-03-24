import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { quizRouter } from './routes/quiz.js';
import { completionRouter } from './routes/completion.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/quiz', quizRouter)
app.use('/completion', completionRouter)

dotenv.config();
const dbConnectionString = process.env.DB_CONNECTION_STRING;

mongoose.connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});


app.listen(process.env.PORT || 3001, () => {
    console.log(`Server is running on port ${process.env.PORT || 3001}`);
});
