* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    padding: 20px;
    background-color: #f0f2f5;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Examiner Details Styles */
.examiner-details {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
}

.examiner-details h2 {
    margin-bottom: 15px;
    color: #333;
    font-size: 1.2em;
}

.examiner-field {
    margin-bottom: 12px;
}

.examiner-field label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-weight: bold;
}

.examiner-field input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

/* Grid Styles for Grade and Type Selection */
.grade-grid, .type-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2x2 grid */
    gap: 15px; /* Matches type-grid */
    max-width: 800px; /* Consistent width, adjustable */
    margin: 15px auto; /* Centered with spacing */
}

/* Grade Button Styles */
.grade-btn {
    padding: 25px; /* Matches type-btn */
    border: 2px solid #4CAF50; /* Matches type-btn */
    background: white; /* Matches type-btn */
    color: #4CAF50; /* Matches type-btn */
    border-radius: 8px; /* Matches type-btn */
    cursor: pointer;
    font-size: 16px; /* Matches type-btn */
    transition: all 0.3s; /* Matches type-btn */
    text-align: center;
}

.grade-btn:hover {
    background: #4CAF50; /* Matches type-btn */
    color: white; /* Matches type-btn */
}

.grade-btn.active {
    background: #2e7d32; /* Slightly darker for active state, customizable */
    color: white;
}

/* Type Button Styles (unchanged, for reference) */
.type-btn {
    padding: 25px;
    border: 2px solid #4CAF50;
    background: white;
    color: #4CAF50;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
}

.type-btn:hover {
    background: #4CAF50;
    color: white;
}

.type-btn.active {
    background: #2e7d32; /* Matches grade-btn active state */
    color: white;
}

/* Subject Button Styles */
.subject-btn.add-subject {
    border-color: #4CAF50;
    color: #4CAF50;
}

.subject-btn.add-subject:hover {
    background-color: #4CAF50;
    color: white;
}

/* Toggle Switch Styles */
.toggle-container {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #2196F3;
}

input:checked + .slider:before {
    transform: translateX(26px);
}

/* Form Styles */
#questionForm {
    display: none;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

select, input, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    font-size: 14px;
}

textarea {
    min-height: 100px;
    resize: vertical;
}

.multiple-choice-option {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.multiple-choice-option input[type="radio"] {
    width: auto;
}

.multiple-choice-option input[type="text"] {
    flex: 1;
}

/* View Mode Styles */
.question-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.question-card h3 {
    color: #2196F3;
    margin-bottom: 10px;
}

.question-card p {
    margin-bottom: 8px;
}

.question-card strong {
    color: #555;
}

/* Utility Classes */
.hidden {
    display: none;
}

button {
    background-color: #2196F3;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #1976D2;
}

.prev-btn {
    background-color: #ccc;
    color: #333;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
}

.prev-btn:hover {
    background-color: #bbb;
}

.submission-btn {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
}

.submit-btn {
    width: auto;
}

/* True/False Answer */
#trueFalseAnswer {
    display: flex;
    gap: 15px;
    margin-top: 10px;
}
