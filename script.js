// Global Variables
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

// Initialize Form
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gradeSubjectQuestionTypeFlow').classList.add('hidden');
    document.getElementById('questionAnswerFlow').classList.add('hidden');
    document.getElementById('viewMode').classList.add('hidden');
    document.getElementById('edit-questions').style.display = 'none';

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

    populateFilterSubjects();
    document.getElementById('linesPerPage').value = linesPerPage;

    // Attach event listener to the "Next" button in examinerDetails
    document.querySelector('#examinerDetails .submit-btn').onclick = submitExaminerDetails;
});

// Handle Grade Selection
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

// Handle Question Type Selection
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedQuestionType = btn.dataset.type;
        document.getElementById('questionType').value = selectedQuestionType;
        toggleAnswerFields(selectedQuestionType);
    });
});

// Navigation
function nextStep(step) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.add('hidden'));
    if (step === 2) {
        document.getElementById('gradeSubjectQuestionTypeFlow').classList.remove('hidden');
    } else if (step === 3) {
        if (!selectedGrade || !selectedSubject || !selectedQuestionType) {
            alert('Please select a grade, subject, and question type.');
            return;
        }
        document.getElementById('questionAnswerFlow').classList.remove('hidden');
    }
    currentStep = step;
}

function previousStep(step) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.add('hidden'));
    if (step === 1) document.getElementById('examinerDetails').classList.remove('hidden');
    else if (step === 2) document.getElementById('gradeSubjectQuestionTypeFlow').classList.remove('hidden');
    currentStep = step;
}

// Toggle Answer Fields
function toggleAnswerFields(type) {
    const answerSections = ['essayAnswer', 'oneWordAnswer', 'multipleChoiceAnswer', 'trueFalseAnswer'];
    answerSections.forEach(section => document.getElementById(section).classList.add('hidden'));
    if (type) document.getElementById(`${type}Answer`).classList.remove('hidden');
}

// Submit Examiner Details
async function submitExaminerDetails() {
    const examName = document.getElementById('examName').value.trim();
    const paperCode = document.getElementById('PaperCode').value.trim();
    const examinerName = document.getElementById('examinerName').value.trim();
    const examYear = document.getElementById('examYear').value.trim();

    if (!examName || !paperCode || !examinerName || !examYear) {
        alert('Please fill in all examination details');
        return;
    }

    const examData = {
        examName,
        paperCode,
        examinerName,
        examYear
    };

    try {
        const response = await fetch(`${API_BASE_URL}/exams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save examination details');
        }

        const result = await response.json();
        alert('Examination details saved successfully!');
        document.getElementById('examName').value = '';
        document.getElementById('PaperCode').value = 'Paper 1'; // Reset to first option
        document.getElementById('examinerName').value = '';
        document.getElementById('examYear').value = '';
        nextStep(2); // Move to grade/subject selection
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Submit Question (Basic Implementation)
async function submitQuestion() {
    const questionText = document.getElementById('question').value.trim();
    const topic = document.getElementById('topic_name').value.trim();
    const subtopic = document.getElementById('subtopic_name').value.trim();
    const questionType = document.getElementById('questionType').value;

    if (!questionText || !questionType) {
        alert('Please enter a question and select a question type.');
        return;
    }

    let answers = [];
    if (questionType === 'essay') {
        const essayAnswer = document.getElementById('essayInput').value.trim();
        if (!essayAnswer) {
            alert('Please provide a model essay answer.');
            return;
        }
        answers.push({ text: essayAnswer, isCorrect: true });
    } else if (questionType === 'oneWord') {
        const oneWordAnswer = document.getElementById('oneWordInput').value.trim();
        if (!oneWordAnswer) {
            alert('Please provide a one-word answer.');
            return;
        }
        answers.push({ text: oneWordAnswer, isCorrect: true });
    } else if (questionType === 'multipleChoice') {
        const options = Array.from(document.querySelectorAll('#multipleChoiceAnswer input[type="text"]'))
            .map((input, i) => ({
                text: input.value.trim(),
                isCorrect: document.getElementById(`option${i}`).checked
            }));
        if (options.every(opt => !opt.text)) {
            alert('Please provide at least one option.');
            return;
        }
        if (!options.some(opt => opt.isCorrect)) {
            alert('Please select a correct answer.');
            return;
        }
        answers = options.filter(opt => opt.text); // Only include non-empty options
    } else if (questionType === 'trueFalse') {
        const trueFalseValue = document.querySelector('#trueFalseAnswer input[name="trueFalse"]:checked');
        if (!trueFalseValue) {
            alert('Please select True or False.');
            return;
        }
        answers.push({ text: trueFalseValue.value, isCorrect: true });
    }

    const questionData = {
        examinerName: document.getElementById('examinerName').value.trim(),
        examName: document.getElementById('examName').value.trim(),
        examYear: document.getElementById('examYear').value.trim(),
        grade: selectedGrade,
        subject: selectedSubject,
        topic,
        subtopic,
        type: questionType,
        questionText,
        answers
    };

    // For now, store locally (mock implementation)
    questions.push({ ...questionData, question_id: questions.length + 1 });
    resetForm();
    displayQuestions();
    alert('Question added successfully!');

    // Uncomment for real API integration (requires server endpoint)
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
        });
        if (!response.ok) throw new Error('Failed to save question');
        const result = await response.json();
        questions.push({ ...questionData, question_id: result.questionId });
        resetForm();
        displayQuestions();
        alert('Question saved successfully!');
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
    */
}

// Reset Form
function resetForm() {
    document.getElementById('question').value = '';
    document.getElementById('questionType').value = '';
    document.getElementById('topic_name').value = '';
    document.getElementById('subtopic_name').value = '';
    document.getElementById('essayInput').value = '';
    document.getElementById('oneWordInput').value = '';
    document.querySelectorAll('#multipleChoiceAnswer input[type="text"]').forEach(input => input.value = '');
    document.querySelectorAll('#multipleChoiceAnswer input[type="radio"]').forEach(input => input.checked = false);
    document.querySelectorAll('#trueFalseAnswer input[type="radio"]').forEach(input => input.checked = false);
    toggleAnswerFields('');
}

// Display Questions
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        let answerDisplay = q.type === 'multipleChoice' ?
            `Options: ${q.answers.map(a => a.text).join(', ')}<br>Correct: ${q.answers.find(a => a.isCorrect)?.text || 'N/A'}` :
            q.answers[0]?.text || 'N/A';

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

// Populate Filter Subjects
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

// Fetch and Display Past Papers
async function fetchAndDisplayPastPapers(filters = {}) {
    try {
        filters.page = currentPage;
        filters.limit = linesPerPage;
        totalPapers = questions.length; // Mock data
        displayPastPapersTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching papers:', error);
        alert('Failed to load past papers');
    }
}

// Display Past Papers Table
function displayPastPapersTable() {
    const tableBody = document.getElementById('papersTableBody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * linesPerPage;
    const end = Math.min(start + linesPerPage, questions.length);
    const paginatedQuestions = questions.slice(start, end);

    paginatedQuestions.forEach(q => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" name="selectPaper" value="${q.question_id}"></td>
            <td>${q.examName || 'Unknown Exam'}</td>
            <td>${q.examYear || 'N/A'}</td>
            <td>${q.grade || 'N/A'}</td>
            <td>${q.subject || 'N/A'}</td>
            <td>${q.topic || 'N/A'} / ${q.subtopic || 'N/A'}</td>
            <td class="status-open">Open</td>
            <td class="actions">
                <button onclick="editQuestion(${q.question_id})">Edit</button>
                <button onclick="deleteQuestion(${q.question_id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('selectAll').addEventListener('change', (e) => {
        document.querySelectorAll('input[name="selectPaper"]').forEach(cb => cb.checked = e.target.checked);
    });
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(totalPapers / linesPerPage) || 1;
    document.getElementById('pageInfo').textContent = `${currentPage} of ${totalPages}`;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchAndDisplayPastPapers();
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalPapers / linesPerPage) || 1;
    if (currentPage < totalPages) {
        currentPage++;
        fetchAndDisplayPastPapers();
    }
}

function updateLinesPerPage() {
    linesPerPage = parseInt(document.getElementById('linesPerPage').value);
    currentPage = 1;
    fetchAndDisplayPastPapers();
}

// Search Papers
function searchPapers() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filters = { search: searchTerm };
    currentPage = 1;
    fetchAndDisplayPastPapers(filters);
}

// Filter Papers
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
    currentPage = 1;
    fetchAndDisplayPastPapers(filters);
}

// Toggle Filter Dropdown
function toggleFilterDropdown() {
    const filterPanel = document.getElementById('filterPanel');
    filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
}

// Edit Question (Stub)
function editQuestion(questionId) {
    alert(`Edit functionality for question ${questionId} not fully implemented yet.`);
}

// Delete Question
async function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.question_id !== questionId);
        fetchAndDisplayPastPapers();
        alert('Question deleted locally.');
    }
}
