// ===============================
// Global Variables
// ===============================
let currentStep = 1;
let selectedGrade = null;
let selectedSubject = null;
let selectedQuestionType = null;
let questions = [];
let editingIndex = -1;
const API_BASE_URL = 'http://localhost:3000/api';
let currentPage = 1;
let linesPerPage = 15;
let totalPapers = 0;

const gradeSubjects = {
    '7': ['Mathematics', 'Science', 'English', 'History'],
    '9': ['Mathematics', 'Biology', 'Physics', 'Chemistry', 'English'],
    '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature'],
    'alevels': ['Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology']
};

// ===============================
// Initialize Form on Page Load
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gradeSubjectQuestionTypeFlow').classList.add('hidden');
    document.getElementById('questionAnswerFlow').classList.add('hidden');
    document.getElementById('viewMode').classList.add('hidden');

    const switchCheckbox = document.getElementById('switch-button');
    const addSection = document.getElementById('add-questions');
    const editSection = document.getElementById('edit-questions');

    switchCheckbox.addEventListener('change', function() {
        if (this.checked) {
            addSection.style.display = 'none';
            editSection.style.display = 'block';
            populateFilterSubjects();
            fetchAndDisplayPastPapers();
        } else {
            addSection.style.display = 'block';
            editSection.style.display = 'none';
        }
    });

    // Populate subjects for filtering on load
    populateFilterSubjects();
    document.getElementById('linesPerPage').value = linesPerPage;
});

// ===============================
// Handle Grade Selection
// ===============================
document.querySelectorAll('.grade-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.grade-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        selectedGrade = button.dataset.grade;
        
        const subjectButtonsContainer = document.querySelector('.subject-buttons');
        subjectButtonsContainer.innerHTML = '';
        
        gradeSubjects[selectedGrade].forEach(subject => {
            const subjectBtn = document.createElement('button');
            subjectBtn.className = 'subject-btn';
            subjectBtn.textContent = subject;
            subjectButtonsContainer.appendChild(subjectBtn);
        });

        document.getElementById('subjectSelection').classList.remove('hidden');

        document.querySelectorAll('.subject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedSubject = btn.textContent;
            });
        });
    });
});

// ===============================
// Handle Question Type Selection
// ===============================
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        selectedQuestionType = btn.dataset.type;
        document.getElementById('questionType').value = selectedQuestionType;
    });
});

// ===============================
// Handle Step Navigation
// ===============================
function nextStep(step) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('hidden');
    });

    if (step === 2) {
        document.getElementById('gradeSubjectQuestionTypeFlow').classList.remove('hidden');
    } else if (step === 3) {
        if (!selectedGrade || !selectedSubject || !selectedQuestionType) {
            alert('Please select a grade, subject, and question type before proceeding.');
            return;
        }
        document.getElementById('questionAnswerFlow').classList.remove('hidden');
        toggleAnswerFields(selectedQuestionType);
    }

    currentStep = step;
}

function previousStep(step) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('hidden');
    });

    if (step === 1) {
        document.getElementById('examinerDetails').classList.remove('hidden');
    } else if (step === 2) {
        document.getElementById('gradeSubjectQuestionTypeFlow').classList.remove('hidden');
    }

    currentStep = step;
}

// ===============================
// Function to Toggle Answer Fields
// ===============================
function toggleAnswerFields(type) {
    document.getElementById('essayAnswer').classList.add('hidden');
    document.getElementById('oneWordAnswer').classList.add('hidden');
    document.getElementById('multipleChoiceAnswer').classList.add('hidden');
    document.getElementById('trueFalseAnswer').classList.add('hidden');

    if (type === 'essay') {
        document.getElementById('essayAnswer').classList.remove('hidden');
    } else if (type === 'oneWord') {
        document.getElementById('oneWordAnswer').classList.remove('hidden');
    } else if (type === 'multipleChoice') {
        document.getElementById('multipleChoiceAnswer').classList.remove('hidden');
    } else if (type === 'trueFalse') {
        document.getElementById('trueFalseAnswer').classList.remove('hidden');
    }
}

// ===============================
// Function to Submit a Question
// ===============================
async function submitQuestion() {
    const questionText = document.getElementById('question').value.trim();
    const type = document.getElementById('questionType').value;
    let answers = [];

    if (!questionText || !type) {
        alert('Please fill in all required fields');
        return;
    }

    if (type === 'essay') {
        const essayAns = document.querySelector('#essayAnswer textarea').value.trim();
        if (!essayAns) return alert('Please provide an essay answer');
        answers.push({ text: essayAns, isCorrect: true });
    } else if (type === 'oneWord') {
        const oneWordAns = document.querySelector('#oneWordAnswer input').value.trim();
        if (!oneWordAns) return alert('Please provide a one-word answer');
        answers.push({ text: oneWordAns, isCorrect: true });
    } else if (type === 'multipleChoice') {
        const optionInputs = document.querySelectorAll('#multipleChoiceAnswer input[type="text"]');
        const options = Array.from(optionInputs).map(input => input.value.trim());
        if (options.some(opt => !opt)) return alert('Please fill all multiple-choice options');
        const selectedRadio = document.querySelector('#multipleChoiceAnswer input[type="radio"]:checked');
        if (!selectedRadio) return alert('Please select the correct answer');
        answers = options.map((opt, i) => ({ text: opt, isCorrect: i === parseInt(selectedRadio.value) }));
    } else if (type === 'trueFalse') {
        const selected = document.querySelector('input[name="trueFalse"]:checked');
        if (!selected) return alert('Please select True or False');
        answers.push({ text: 'True', isCorrect: selected.value === 'true' });
        answers.push({ text: 'False', isCorrect: selected.value === 'false' });
    }

    const examinerName = document.getElementById('examinerName').value.trim();
    const examName = document.getElementById('examName').value.trim();
    const examYear = document.getElementById('examYear').value.trim();
    const topic = document.getElementById('topic_name').value.trim();
    const subtopic = document.getElementById('subtopic_name').value.trim();
    const grade = document.getElementById('level_name').value.trim();
    const marks = 2; // Example, adjust as needed

    const questionData = {
        examId: 1, // Replace with dynamic exam ID
        sectionId: 1, // Replace with dynamic section ID
        questionText,
        marks,
        type,
        answers,
        examinerName,
        examName,
        examYear,
        topic,
        subtopic,
        grade
    };

    try {
        const token = localStorage.getItem('token');
        const response = editingIndex === -1 ?
            await fetch(`${API_BASE_URL}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(questionData)
            }) :
            await fetch(`${API_BASE_URL}/questions/${questions[editingIndex].question_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(questionData)
            });

        if (!response.ok) throw new Error('Failed to submit question');
        const result = await response.json();

        if (editingIndex === -1) {
            questions.push({ ...questionData, question_id: result.questionId });
            alert('Question added successfully!');
        } else {
            questions[editingIndex] = { ...questionData, question_id: questions[editingIndex].question_id };
            alert('Question updated successfully!');
            editingIndex = -1;
            document.getElementById('switch-button').checked = false;
            document.getElementById('add-questions').style.display = 'block';
            document.getElementById('edit-questions').style.display = 'none';
        }

        document.getElementById('question').value = '';
        document.getElementById('questionType').value = '';
        document.getElementById('topic_name').value = '';
        document.getElementById('subtopic_name').value = '';
        document.getElementById('level_name').value = '7'; // Reset to default Grade 7
        document.querySelector('#essayAnswer textarea').value = '';
        document.querySelector('#oneWordAnswer input').value = '';
        document.querySelectorAll('#multipleChoiceAnswer input[type="text"]').forEach(input => input.value = '');
        document.querySelectorAll('#multipleChoiceAnswer input[type="radio"]').forEach(input => input.checked = false);
        document.querySelectorAll('#trueFalseAnswer input[type="radio"]').forEach(input => input.checked = false);

        displayQuestions();
        fetchAndDisplayPastPapers(); // Refresh past papers after submission
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// ===============================
// Function to Display Questions (View Mode)
// ===============================
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        let answerDisplay = '';
        if (q.type === 'multipleChoice') {
            const correctIndex = q.answers.findIndex(a => a.isCorrect);
            answerDisplay = `
                Options: ${q.answers.map(a => a.text).join(', ')}
                <br>Correct Answer: ${q.answers[correctIndex]?.text || 'N/A'}
            `;
        } else {
            answerDisplay = q.answers[0]?.text || 'N/A';
        }

        questionCard.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p><strong>Examiner:</strong> ${q.examinerName || 'N/A'}</p>
            <p><strong>Exam:</strong> ${q.examName || 'N/A'} (${q.examYear || 'N/A'})</p>
            <p><strong>Grade:</strong> ${q.grade || 'N/A'}</p>
            <p><strong>Subject:</strong> ${q.subject || 'N/A'}</p>
            <p><strong>Topic:</strong> ${q.topic || 'N/A'}</p>
            <p><strong>Sub-Topic:</strong> ${q.subtopic || 'N/A'}</p>
            <p><strong>Type:</strong> ${q.type}</p>
            <p><strong>Question:</strong> ${q.questionText}</p>
            <p><strong>Answer:</strong> ${answerDisplay}</p>
        `;
        
        questionsList.appendChild(questionCard);
    });
}

// ===============================
// Populate Filter Subjects
// ===============================
function populateFilterSubjects() {
    const subjectSelect = document.getElementById('filterSubject');
    subjectSelect.innerHTML = '<option value="">All Subjects</option>';
    const allSubjects = Array.from(new Set(Object.values(gradeSubjects).flat()));
    allSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

// ===============================
// Fetch and Display Past Papers (Table Version)
async function fetchAndDisplayPastPapers(filters = {}) {
    try {
        const token = localStorage.getItem('token');
        filters.page = currentPage;
        filters.limit = linesPerPage;
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/questions?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch papers');
        const data = await response.json();
        questions = data.data || data; // Adjust based on backend response format
        totalPapers = data.total || questions.length; // Adjust based on backend total count
        displayPastPapersTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching papers:', error);
        alert('Failed to load past papers');
    }
}

// ===============================
// Display Past Papers in Table
// ===============================
function displayPastPapersTable() {
    const tableBody = document.getElementById('papersTableBody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * linesPerPage;
    const end = start + linesPerPage;
    const paginatedQuestions = questions.slice(start, end);

    paginatedQuestions.forEach(q => {
        const row = document.createElement('tr');
        const exam = questions.find(p => p.exam_id === q.exam_id && p.paper_id === q.paper_id);
        row.innerHTML = `
            <td><input type="checkbox" name="selectPaper" value="${q.question_id}"></td>
            <td>${exam?.exam_code || 'Unknown Exam'}</td>
            <td>${exam?.year || 'N/A'}</td>
            <td>${exam?.grade_name || 'N/A'}</td>
            <td>${exam?.subject_name || 'N/A'}</td>
            <td>${q.topic || 'N/A'} / ${q.subtopic || 'N/A'}</td> <!-- Display Topic/Subtopic -->
            <td class="status-${exam?.term === 'Term 1' ? 'open' : 'closed'}">${exam?.term || 'N/A'}</td>
            <td class="actions">
                <button onclick="editQuestion(${q.question_id})">Edit</button>
                <button onclick="deleteQuestion(${q.question_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Handle select all checkbox
    document.getElementById('selectAll').addEventListener('change', (e) => {
        document.querySelectorAll('input[name="selectPaper"]').forEach(cb => cb.checked = e.target.checked);
    });
}

// ===============================
// Pagination Functions
// ===============================
function updatePagination() {
    const totalPages = Math.ceil(totalPapers / linesPerPage);
    document.getElementById('pageInfo').textContent = `${currentPage} of ${totalPages}`;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchAndDisplayPastPapers();
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalPapers / linesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        fetchAndDisplayPastPapers();
    }
}

// ===============================
// Search Papers
// ===============================
function searchPapers() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filters = {
        search: searchTerm
    };
    currentPage = 1; // Reset to first page on search
    fetchAndDisplayPastPapers(filters);
}

// ===============================
// Filter Papers
// ===============================
function filterPapers() {
    const filters = {
        grade: document.getElementById('filterGrade').value,
        subject: document.getElementById('filterSubject').value,
        year: document.getElementById('filterYear').value,
        examName: document.getElementById('filterExamName').value.trim(),
        topic: document.getElementById('filterTopic').value.trim(),
        subtopic: document.getElementById('filterSubtopic').value.trim()
    };
    Object.keys(filters).forEach(key => filters[key] === '' && delete filters[key]);
    currentPage = 1; // Reset to first page on filter
    fetchAndDisplayPastPapers(filters);
}

// ===============================
// Toggle Filter Dropdown
// ===============================
function toggleFilterDropdown() {
    const filterPanel = document.getElementById('filterPanel');
    filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
    document.getElementById('filterToggle').textContent = filterPanel.style.display === 'none' ? 'Filters' : 'Filters';
}

// ===============================
// Edit Question
// ===============================
function editQuestion(questionId) {
    const question = questions.find(q => q.question_id === questionId);
    editingIndex = questions.indexOf(question);

    document.getElementById('examinerName').value = question.examinerName || '';
    document.getElementById('examName').value = question.exam_code || '';
    document.getElementById('examYear').value = question.year || '';
    selectedGrade = question.grade_name;
    selectedSubject = question.subject_name;
    selectedQuestionType = question.question_type.replace('_', ''); // Adjust for frontend
    
    document.getElementById('question').value = question.question_text;
    document.getElementById('questionType').value = selectedQuestionType;
    document.getElementById('topic_name').value = question.topic || '';
    document.getElementById('subtopic_name').value = question.subtopic || '';
    document.getElementById('level_name').value = selectedGrade || '7';

    toggleAnswerFields(selectedQuestionType);
    
    if (selectedQuestionType === 'longanswer') {
        document.querySelector('#essayAnswer textarea').value = question.answers[0]?.answer_text || '';
    } else if (selectedQuestionType === 'shortanswer') {
        document.querySelector('#oneWordAnswer input').value = question.answers[0]?.answer_text || '';
    } else if (selectedQuestionType === 'multiplechoice') {
        const optionInputs = document.querySelectorAll('#multipleChoiceAnswer input[type="text"]');
        question.answers.forEach((ans, i) => {
            optionInputs[i].value = ans.answer_text;
            if (ans.is_correct) document.querySelector(`#option${i}`).checked = true;
        });
    } else if (selectedQuestionType === 'truefalse') {
        document.querySelector(`#${question.answers.find(a => a.is_correct)?.answer_text.toLowerCase() === 'true' ? 'trueOption' : 'falseOption'}`).checked = true;
    }

    document.getElementById('switch-button').checked = false;
    document.getElementById('add-questions').style.display = 'block';
    document.getElementById('edit-questions').style.display = 'none';
    nextStep(3);
}

// ===============================
// Delete Question
// ===============================
async function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete question');
            questions = questions.filter(q => q.question_id !== questionId);
            fetchAndDisplayPastPapers(); // Refresh table after deletion
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}
