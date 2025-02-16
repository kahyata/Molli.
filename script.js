// ... (existing code remains the same until submitQuestion function)

// Submit question
function submitQuestion() {
    const examinerName = document.getElementById('examinerName').value.trim();
    const examName = document.getElementById('examName').value.trim();
    const examYear = document.getElementById('examYear').value.trim();
    const questionText = document.getElementById('question').value.trim();
    const type = questionType.value;
    let answer;

    // Basic validation
    if (!examinerName || !examName || !examYear || !questionText || !type) {
        alert('Please fill in all required fields');
        return;
    }

    // Handle different answer types
    if (type === 'essay') {
        const essayAns = essayAnswer.querySelector('textarea').value.trim();
        if (!essayAns) {
            alert('Please provide an essay answer');
            return;
        }
        answer = essayAns;
    } else if (type === 'oneWord') {
        const oneWordAns = oneWordAnswer.querySelector('input').value.trim();
        if (!oneWordAns) {
            alert('Please provide a one-word answer');
            return;
        }
        answer = oneWordAns;
    } else if (type === 'multipleChoice') {
        const optionInputs = multipleChoiceAnswer.querySelectorAll('input[type="text"]');
        const options = Array.from(optionInputs).map(input => input.value.trim());
        if (options.some(opt => !opt)) {
            alert('Please fill all multiple choice options');
            return;
        }
        const selectedRadio = multipleChoiceAnswer.querySelector('input[type="radio"]:checked');
        if (!selectedRadio) {
            alert('Please select the correct answer');
            return;
        }
        answer = {
            options: options,
            correctIndex: parseInt(selectedRadio.value)
        };
    }

    // Create question object
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

    // Add to questions array
    questions.push(question);
    
    // Clear form fields
    document.getElementById('examinerName').value = '';
    document.getElementById('examName').value = '';
    document.getElementById('examYear').value = '';
    document.getElementById('question').value = '';
    questionType.value = '';
    essayAnswer.querySelector('textarea').value = '';
    oneWordAnswer.querySelector('input').value = '';
    multipleChoiceAnswer.querySelectorAll('input').forEach(input => {
        if (input.type === 'text') input.value = '';
        if (input.type === 'radio') input.checked = false;
    });

    alert('Question added successfully!');
}

// Display questions in view mode
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p><strong>Examiner:</strong> ${q.examinerName}</p>
            <p><strong>Exam:</strong> ${q.examName} (${q.examYear})</p>
            <p><strong>Grade:</strong> ${q.grade}</p>
            <p><strong>Subject:</strong> ${q.subject}</p>
            <p><strong>Question:</strong> ${q.questionText}</p>
            <p><strong>Type:</strong> ${q.type}</p>
            <div class="answer-section">
                ${q.type === 'essay' ? `<p><strong>Model Answer:</strong><br>${q.answer}</p>` : ''}
                ${q.type === 'oneWord' ? `<p><strong>Correct Answer:</strong> ${q.answer}</p>` : ''}
                ${q.type === 'multipleChoice' ? `
                    <strong>Options:</strong>
                    <ul>
                        ${q.answer.options.map((opt, i) => `
                            <li class="${i === q.answer.correctIndex ? 'correct-answer' : ''}">
                                ${opt} ${i === q.answer.correctIndex ? '✓' : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
        questionsList.appendChild(questionDiv);
    });
}