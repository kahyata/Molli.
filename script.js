// ===============================
// Global Variables
// ===============================
let currentStep = 1;
let selectedGrade = null;
let selectedSubject = null;
let selectedQuestionType = null;
let questions = [];

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
    // Hide all sections except examiner details
    document.getElementById('gradeSubjectFlow').classList.add('hidden');
    document.getElementById('questionTypeSelection').classList.add('hidden');
    document.getElementById('questionAnswerFlow').classList.add('hidden');
    document.getElementById('viewMode').classList.add('hidden');
});

// ===============================
// Handle Grade Selection
// ===============================
document.querySelectorAll('.grade-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all grade buttons
        document.querySelectorAll('.grade-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to selected button
        button.classList.add('active');
        
        selectedGrade = button.dataset.grade;
        
        // Populate subject buttons
        const subjectButtonsContainer = document.querySelector('.subject-buttons');
        subjectButtonsContainer.innerHTML = ''; // Clear existing buttons
        
        gradeSubjects[selectedGrade].forEach(subject => {
            const subjectBtn = document.createElement('button');
            subjectBtn.className = 'subject-btn';
            subjectBtn.textContent = subject;
            subjectButtonsContainer.appendChild(subjectBtn);
        });

        // Show subject selection
        document.getElementById('subjectSelection').classList.remove('hidden');

        // Add click handlers to new subject buttons
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
// Handle Step Navigation
// ===============================
function nextStep(step) {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show the current step
    if (step === 2) {
        document.getElementById('gradeSubjectFlow').classList.remove('hidden');
    } else if (step === 3) {
        document.getElementById('questionTypeSelection').classList.remove('hidden');
    } else if (step === 4) {
        document.getElementById('questionAnswerFlow').classList.remove('hidden');
        toggleAnswerFields(selectedQuestionType);
    }

    currentStep = step;
}

// ===============================
// Handle Question Type Selection
// ===============================
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all type buttons
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        // Add active class to selected button
        btn.classList.add('active');
        
        selectedQuestionType = btn.dataset.type;
        document.getElementById('questionType').value = selectedQuestionType;
    });
});

// ===============================
// Function to Toggle Answer Fields
// ===============================
function toggleAnswerFields(type) {
    // Hide all answer fields first
    document.getElementById('essayAnswer').classList.add('hidden');
    document.getElementById('oneWordAnswer').classList.add('hidden');
    document.getElementById('multipleChoiceAnswer').classList.add('hidden');
    document.getElementById('trueFalseAnswer').classList.add('hidden');

    // Show the selected answer field
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

    // Basic Validation
    if (!questionText || !type) {
        alert('Please fill in all required fields');
        return;
    }

    // Handle Different Answer Types
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

    // Get examiner details
    const examinerName = document.getElementById('examinerName').value.trim();
    const examName = document.getElementById('examName').value.trim();
    const examYear = document.getElementById('examYear').value.trim();

    // Create Question Object
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

    // Add Question to Array
    questions.push(question);

    // Reset Form Fields
    document.getElementById('question').value = '';
    document.getElementById('questionType').value = '';
    document.querySelector('#essayAnswer textarea').value = '';
    document.querySelector('#oneWordAnswer input').value = '';
    document.querySelectorAll('#multipleChoiceAnswer input[type="text"]').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('#multipleChoiceAnswer input[type="radio"]').forEach(input => {
        input.checked = false;
    });
    document.querySelectorAll('#trueFalseAnswer input[type="radio"]').forEach(input => {
        input.checked = false;
    });

    alert('Question added successfully!');
    displayQuestions();
}

// ===============================
// Function to Display Questions
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
