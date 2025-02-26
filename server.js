const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Database connected', result: rows[0].result });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// API endpoint to save examination details
app.post('/api/exams', async (req, res) => {
    const { examName, paperCode, examinerName, examYear } = req.body;

    // Validate all required fields
    if (!examName || !paperCode || !examinerName || !examYear) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate examYear
    const examYearInt = parseInt(examYear);
    if (isNaN(examYearInt) || examYearInt < 1900 || examYearInt > 9999) {
        return res.status(400).json({ error: 'Invalid examYear. Must be a number between 1900 and 9999' });
    }

    try {
        // Insert into subjects
        const [subjectResult] = await db.query(
            'INSERT INTO subjects (subject_name, subject_code) VALUES (?, ?) ON DUPLICATE KEY UPDATE subject_id = LAST_INSERT_ID(subject_id)',
            [examName.split(' ')[0], examName.split(' ')[0].slice(0, 4).toUpperCase()]
        );
        const subjectId = subjectResult.insertId;

        // Insert into grades (hardcoded for now)
        const [gradeResult] = await db.query(
            'INSERT INTO grades (grade_name, education_level) VALUES (?, ?) ON DUPLICATE KEY UPDATE grade_id = LAST_INSERT_ID(grade_id)',
            ['Grade 10', 'secondary']
        );
        const gradeId = gradeResult.insertId;

        // Insert into exams
        const examCode = `${examName.split(' ')[0].slice(0, 4).toUpperCase()}-${examYearInt}-T1-G10`;
        const [examResult] = await db.query(
            'INSERT INTO exams (subject_id, grade_id, year, term, exam_code) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE exam_id = LAST_INSERT_ID(exam_id)',
            [subjectId, gradeId, examYearInt, 'Term 1', examCode]
        );
        const examId = examResult.insertId;

        // Validate and parse paperNumber
        const paperParts = paperCode.split(' ');
        if (paperParts.length < 2 || isNaN(parseInt(paperParts[1]))) {
            return res.status(400).json({ error: 'Invalid paperCode format. Expected format: "Paper <number>"' });
        }
        const paperNumber = parseInt(paperParts[1]);

        // Insert into questionpapers with duplicate handling
        const [paperResult] = await db.query(
            'INSERT INTO questionpapers (exam_id, paper_number, paper_type, total_marks) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE paper_id = LAST_INSERT_ID(paper_id)',
            [examId, paperNumber, 'Multiple Choice', 50]
        );

        // Insert examiner into users
        const [userResult] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_id = LAST_INSERT_ID(user_id)',
            [examinerName.toLowerCase().replace(' ', '_'), `${examinerName.toLowerCase().replace(' ', '_')}@school.com`, 'hashed_password', 'teacher']
        );

        res.status(201).json({ message: 'Examination details saved', examId: examResult.insertId });
    } catch (error) {
        console.error('Error saving exam:', error);
        res.status(500).json({ error: 'Failed to save examination details', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});