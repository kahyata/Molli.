// script.js

// Function to show specific step in the form
function showStep(stepNumber) {
    document.getElementById('step1').classList.toggle('active', stepNumber === 1);
    document.getElementById('step2').classList.toggle('active', stepNumber === 2);
    document.getElementById('examinerDetails').classList.toggle('hidden', stepNumber !== 1);
    document.getElementById('questionAnswerFlow').classList.toggle('hidden', stepNumber !== 2);
}

// Function to go to next step
function submitExaminerDetails() {
    showStep(2);
}

// Function to go to previous step
function previousStep(stepNumber) {
    showStep(stepNumber);
}

// Function to submit question
function submitQuestion() {
    console.log('Question submitted');
    showStep(1);
}

// Function to show content in main area
function showContent(contentId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(contentId).classList.remove('hidden');
}

// Function to toggle profile section (placeholder)
function toggleProfileSection() {
    console.log('Profile section toggled');
}

// Initialize year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('examYear');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Start at step 1 for the form
    showStep(1);
    // Populate year dropdown
    populateYearDropdown();
    // Show Data Analytics as default content
    showContent('dataAnalytics');
});

        // Filter functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        const notificationItems = document.querySelectorAll('.notification-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filter = button.dataset.filter;

                notificationItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'flex';
                    } else if (filter === 'read' && !item.classList.contains('unread')) {
                        item.style.display = 'flex';
                    } else if (filter === 'unread' && item.classList.contains('unread')) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Close button functionality
        document.querySelector('.close-btn').addEventListener('click', () => {
            document.querySelector('.notifications-container').style.display = 'none';
        });

        // Individual notification dismissal
        document.querySelectorAll('.notification-dismiss').forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.notification-item').remove();
            });
        });

        // Clear all notifications
        document.querySelector('.clear-all').addEventListener('click', () => {
            document.querySelectorAll('.notification-item').forEach(item => {
                item.remove();
            });
        });

        // See more button
        document.querySelector('.see-more').addEventListener('click', () => {
            const newNotification = document.createElement('div');
            newNotification.className = 'notification-item unread';
            newNotification.innerHTML = `
                <div class="notification-icon"></div>
                <div class="notification-content">
                    <h3 class="notification-title">New Notification</h3>
                    <p class="notification-message">This is a new notification</p>
                    <span class="notification-time">Just now</span>
                </div>
                <button class="notification-dismiss">×</button>
            `;
            document.querySelector('.notifications-list').appendChild(newNotification);
            
            newNotification.querySelector('.notification-dismiss').addEventListener('click', (e) => {
                e.target.closest('.notification-item').remove();
            });
        });
