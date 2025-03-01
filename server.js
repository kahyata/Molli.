const express = require('express');
const cors = require('cors');
const db = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load JSON data
const dataPath = path.join(__dirname, 'data.json');
const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Database connected', result: rows[0].result });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// API endpoint to fetch sample data
app.get('/api/sample-data', (req, res) => {
    res.json(jsonData);
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
    if (isNaN(examYearInt)) {
        return res.status(400).json({ error: 'Invalid examYear. Must be a number.' });
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

// API endpoint to fetch past papers with search and filters
app.get('/api/past-papers', async (req, res) => {
    const { search, grade, subject, year, examName, topic, subtopic, page = 1, limit = 15 } = req.query;

    try {
        let query = `
            SELECT 
                qp.paper_id,
                e.exam_name,
                e.year,
                g.grade_name,
                s.subject_name,
                q.topic,
                q.subtopic,
                qp.paper_type,
                qp.total_marks
            FROM questionpapers qp
            JOIN exams e ON qp.exam_id = e.exam_id
            JOIN subjects s ON e.subject_id = s.subject_id
            JOIN grades g ON e.grade_id = g.grade_id
            JOIN questions q ON qp.paper_id = q.section_id
            WHERE 1=1
        `;

        const params = [];

        // Apply search and filters
        if (search) {
            query += ` AND (e.exam_name LIKE ? OR s.subject_name LIKE ? OR q.topic LIKE ? OR q.subtopic LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (grade) {
            query += ` AND g.grade_name = ?`;
            params.push(grade);
        }
        if (subject) {
            query += ` AND s.subject_name = ?`;
            params.push(subject);
        }
        if (year) {
            query += ` AND e.year = ?`;
            params.push(year);
        }
        if (examName) {
            query += ` AND e.exam_name LIKE ?`;
            params.push(`%${examName}%`);
        }
        if (topic) {
            query += ` AND q.topic LIKE ?`;
            params.push(`%${topic}%`);
        }
        if (subtopic) {
            query += ` AND q.subtopic LIKE ?`;
            params.push(`%${subtopic}%`);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        // Execute the query
        const [rows] = await db.query(query, params);

        // Get total count for pagination
        const [totalCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM questionpapers qp
            JOIN exams e ON qp.exam_id = e.exam_id
            JOIN subjects s ON e.subject_id = s.subject_id
            JOIN grades g ON e.grade_id = g.grade_id
            JOIN questions q ON qp.paper_id = q.section_id
            WHERE 1=1
        `);

        res.json({
            data: rows,
            total: totalCount[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching past papers:', error);
        res.status(500).json({ error: 'Failed to fetch past papers', details: error.message });
    }
});

// API endpoint to add a question
app.post('/api/questions', async (req, res) => {
    const { examinerName, examName, examYear, grade, subject, topic, subtopic, type, questionText, answers } = req.body;

    if (!examinerName || !examName || !examYear || !grade || !subject || !topic || !subtopic || !type || !questionText || !answers) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Insert into questions table
        const [questionResult] = await db.query(
            'INSERT INTO questions (section_id, question_number, question_text, marks, question_type, topic, subtopic) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [1, 1, questionText, 10, type, topic, subtopic] // section_id and question_number are hardcoded for now
        );
        const questionId = questionResult.insertId;

        // Insert answers into answers table
        for (const answer of answers) {
            await db.query(
                'INSERT INTO answers (question_id, answer_text, is_correct, explanation) VALUES (?, ?, ?, ?)',
                [questionId, answer.text, answer.isCorrect, answer.explanation || null]
            );
        }

        res.status(201).json({ message: 'Question added successfully', questionId });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Failed to add question', details: error.message });
    }
});

// API endpoint to edit a question
app.put('/api/questions/:id', async (req, res) => {
    const questionId = req.params.id;
    const { questionText, topic, subtopic, type, answers } = req.body;

    if (!questionText || !topic || !subtopic || !type || !answers) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Update the question
        await db.query(
            'UPDATE questions SET question_text = ?, topic = ?, subtopic = ?, question_type = ? WHERE question_id = ?',
            [questionText, topic, subtopic, type, questionId]
        );

        // Delete existing answers
        await db.query('DELETE FROM answers WHERE question_id = ?', [questionId]);

        // Insert updated answers
        for (const answer of answers) {
            await db.query(
                'INSERT INTO answers (question_id, answer_text, is_correct, explanation) VALUES (?, ?, ?, ?)',
                [questionId, answer.text, answer.isCorrect, answer.explanation || null]
            );
        }

        res.json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question', details: error.message });
    }
});

// API endpoint to delete a question
app.delete('/api/questions/:id', async (req, res) => {
    const questionId = req.params.id;

    try {
        // Delete the question
        await db.query('DELETE FROM questions WHERE question_id = ?', [questionId]);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});