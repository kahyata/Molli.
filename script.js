// ===============================
// Global Variables
// ===============================
let currentStep = 1;
let selectedGrade = null;
let selectedSubject = null;
let selectedQuestionType = null;
let questions = [];
let editingIndex = -1;

// Define subjects for each grade
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
            displayEditQuestions();
        } else {
            addSection.style.display = 'block';
            editSection.style.display = 'none';
        }
    });
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
function submitQuestion() {
    const questionText = document.getElementById('question').value.trim();
    const type = document.getElementById('questionType').value;
    let answer;

    if (!questionText || !type) {
        alert('Please fill in all required fields');
        return;
    }

    if (type === 'essay') {
        const essayAns = document.querySelector('#essayAnswer textarea').value.trim();
        if (!essayAns) {
            alert('Please provide an essay answer');
            return;
        }
        answer = essayAns;
    } else if (type === 'oneWord') {
        const oneWordAns = document.querySelector('#oneWordAnswer input').value.trim();
        if (!oneWordAns) {
            alert('Please provide a one-word answer');
            return;
        }
        answer = oneWordAns;
    } else if (type === 'multipleChoice') {
        const optionInputs = document.querySelectorAll('#multipleChoiceAnswer input[type="text"]');
        const options = Array.from(optionInputs).map(input => input.value.trim());
        if (options.some(opt => !opt)) {
            alert('Please fill all multiple-choice options');
            return;
        }
        const selectedRadio = document.querySelector('#multipleChoiceAnswer input[type="radio"]:checked');
        if (!selectedRadio) {
            alert('Please select the correct answer');
            return;
        }
        answer = {
            options: options,
            correctIndex: parseInt(selectedRadio.value)
        };
    } else if (type === 'trueFalse') {
        const selected = document.querySelector('input[name="trueFalse"]:checked');
        if (!selected) {
            alert('Please select True or False');
            return;
        }
        answer = selected.value === 'true';
    }

    const examinerName = document.getElementById('examinerName').value.trim();
    const examName = document.getElementById('examName').value.trim();
    const examYear = document.getElementById('examYear').value.trim();

    const question = {
        examinerName,
        examName,
        examYear,
        grade: selectedGrade,
        subject: selectedSubject,
        questionText,
        type,
        answer
    };

    if (editingIndex === -1) {
        questions.push(question);
        alert('Question added successfully!');
    } else {
        questions[editingIndex] = question;
        alert('Question updated successfully!');
        editingIndex = -1;
        document.getElementById('switch-button').checked = false;
        document.getElementById('add-questions').style.display = 'block';
        document.getElementById('edit-questions').style.display = 'none';
    }

    document.getElementById('question').value = '';
    document.getElementById('questionType').value = '';
    document.querySelector('#essayAnswer textarea').value = '';
    document.querySelector('#oneWordAnswer input').value = '';
    document.querySelectorAll('#multipleChoiceAnswer input[type="text"]').forEach(input => input.value = '');
    document.querySelectorAll('#multipleChoiceAnswer input[type="radio"]').forEach(input => input.checked = false);
    document.querySelectorAll('#trueFalseAnswer input[type="radio"]').forEach(input => input.checked = false);

    displayQuestions();
    displayEditQuestions();
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
            answerDisplay = `
                Options: ${q.answer.options.join(', ')}
                <br>Correct Answer: ${q.answer.options[q.answer.correctIndex]}
            `;
        } else {
            answerDisplay = q.answer.toString();
        }

        questionCard.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p><strong>Examiner:</strong> ${q.examinerName}</p>
            <p><strong>Exam:</strong> ${q.examName} (${q.examYear})</p>
            <p><strong>Grade:</strong> ${q.grade}</p>
            <p><strong>Subject:</strong> ${q.subject}</p>
            <p><strong>Type:</strong> ${q.type}</p>
            <p><strong>Question:</strong> ${q.questionText}</p>
            <p><strong>Answer:</strong> ${answerDisplay}</p>
        `;
        
        questionsList.appendChild(questionCard);
    });
}

// ===============================
// Function to Display Questions for Editing
// ===============================
function displayEditQuestions() {
    const editQuestionsList = document.getElementById('editQuestionsList');
    editQuestionsList.innerHTML = '';

    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        
        let answerDisplay = '';
        if (q.type === 'multipleChoice') {
            answerDisplay = `
                Options: ${q.answer.options.join(', ')}
                <br>Correct Answer: ${q.answer.options[q.answer.correctIndex]}
            `;
        } else {
            answerDisplay = q.answer.toString();
        }

        questionCard.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p><strong>Examiner:</strong> ${q.examinerName}</p>
            <p><strong>Exam:</strong> ${q.examName} (${q.examYear})</p>
            <p><strong>Grade:</strong> ${q.grade}</p>
            <p><strong>Subject:</strong> ${q.subject}</p>
            <p><strong>Type:</strong> ${q.type}</p>
            <p><strong>Question:</strong> ${q.questionText}</p>
            <p><strong>Answer:</strong> ${answerDisplay}</p>
            <button onclick="editQuestion(${index})">Edit</button>
            <button onclick="deleteQuestion(${index})">Delete</button>
        `;
        
        editQuestionsList.appendChild(questionCard);
    });
}

// ===============================
// Function to Edit a Question
// ===============================
function editQuestion(index) {
    const q = questions[index];
    editingIndex = index;

    document.getElementById('examinerName').value = q.examinerName;
    document.getElementById('examName').value = q.examName;
    document.getElementById('examYear').value = q.examYear;
    selectedGrade = q.grade;
    selectedSubject = q.subject;
    selectedQuestionType = q.type;
    
    document.getElementById('question').value = q.questionText;
    document.getElementById('questionType').value = q.type;
    
    toggleAnswerFields(q.type);
    
    if (q.type === 'essay') {
        document.querySelector('#essayAnswer textarea').value = q.answer;
    } else if (q.type === 'oneWord') {
        document.querySelector('#oneWordAnswer input').value = q.answer;
    } else if (q.type === 'multipleChoice') {
        const optionInputs = document.querySelectorAll('#multipleChoiceAnswer input[type="text"]');
        q.answer.options.forEach((opt, i) => {
            optionInputs[i].value = opt;
        });
        document.querySelector(`#option${q.answer.correctIndex}`).checked = true;
    } else if (q.type === 'trueFalse') {
        document.querySelector(`#${q.answer ? 'trueOption' : 'falseOption'}`).checked = true;
    }

    document.getElementById('switch-button').checked = false;
    document.getElementById('add-questions').style.display = 'block';
    document.getElementById('edit-questions').style.display = 'none';
    nextStep(3);
}

// ===============================
// Function to Delete a Question
// ===============================
function deleteQuestion(index) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions.splice(index, 1);
        displayEditQuestions();
        displayQuestions();
    }
}
