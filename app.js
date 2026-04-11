// ==========================================
// MODEL: Робота з localStorage
// ==========================================
class PollModel {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.polls = JSON.parse(localStorage.getItem('polls')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    registerUser(userData) {
        this.users.push(userData);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.setCurrentUser(userData);
    }

    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.setCurrentUser(user);
            return true;
        }
        return false;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    addPoll(question, options) {
        const userPolls = this.polls.filter(p => p.creatorEmail === this.currentUser.email);
        if (userPolls.length >= 5) return { success: false, message: 'Ліміт 5 опитувань вичерпано!' };

        const newPoll = {
            id: Date.now(),
            creatorName: this.currentUser.name,
            creatorEmail: this.currentUser.email,
            question,
            options: options.map(opt => ({ text: opt, votes: 0 })),
            createdAt: new Date().toLocaleString(),
            voters: [] // Список email-ів тих, хто вже проголосував
        };

        this.polls.push(newPoll);
        localStorage.setItem('polls', JSON.stringify(this.polls));
        return { success: true };
    }

    vote(pollId, optionIndex) {
        const poll = this.polls.find(p => p.id === pollId);
        if (poll && !poll.voters.includes(this.currentUser.email)) {
            poll.options[optionIndex].votes++;
            poll.voters.push(this.currentUser.email);
            localStorage.setItem('polls', JSON.stringify(this.polls));
            return true;
        }
        return false;
    }
}

// ==========================================
// VIEW & CONTROLLER
// ==========================================
class PollApp {
    constructor(model) {
        this.model = model;
        this.init();
    }

    init() {
        const path = window.location.pathname;

        if (path.includes('register.html')) this.setupRegistration();
        if (path.includes('index.html')) this.setupLogin();
        if (path.includes('profile.html')) this.renderProfile();
        if (path.includes('app.html')) this.setupCreation();
        if (path.includes('view-polls.html')) this.renderAllPolls();
    }

    // --- Реєстрація ---
setupRegistration() {
        const form = document.querySelector('form');
        form.onsubmit = (e) => {
            e.preventDefault();
            // Знаходимо поле пароля
            const passInput = form.querySelector('input[type="password"]');
            
            const userData = {
                name: form.querySelector('input[placeholder="Іван Іванов"]').value,
                email: form.querySelector('input[type="email"]').value,
                gender: form.querySelector('select').value,
                dob: form.querySelector('input[type="date"]').value,
                password: passInput.value // Тепер беремо реальний пароль
            };
            this.model.registerUser(userData);
            alert('Реєстрація успішна!');
            window.location.href = 'profile.html';
        };
    }

    // --- Вхід ---
    setupLogin() {
        const form = document.querySelector('form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            const pass = form.querySelector('input[type="password"]').value;
            if (this.model.loginUser(email, pass)) {
                window.location.href = 'profile.html';
            } else {
                alert('Невірний email або пароль');
            }
        };
    }

    // --- Профіль ---
    renderProfile() {
        const user = this.model.currentUser;
        if (!user) { window.location.href = 'index.html'; return; }

        // Відображення даних таблиці
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = `
            <tr><td><strong>Ім'я</strong></td><td>${user.name}</td></tr>
            <tr><td><strong>Email</strong></td><td>${user.email}</td></tr>
            <tr><td><strong>Стать</strong></td><td>${user.gender}</td></tr>
            <tr><td><strong>Дата народження</strong></td><td>${user.dob}</td></tr>
        `;

        // Відображення власних опитувань під таблицею
        const main = document.querySelector('main');
        const myPolls = this.model.polls.filter(p => p.creatorEmail === user.email);
        
        const pollSection = document.createElement('div');
        pollSection.className = 'mt-5';
        pollSection.innerHTML = `<h3>Ваші опитування (${myPolls.length}/5)</h3>`;
        
        myPolls.forEach(p => {
            pollSection.innerHTML += `<div class="alert alert-info">${p.question} <small>(${p.createdAt})</small></div>`;
        });
        main.appendChild(pollSection);
    }

    // --- Створення опитування ---
    setupCreation() {
        const form = document.querySelector('form');
        const addBtn = form.querySelector('.btn-outline-secondary');
        let optionCount = 3;

        // Оживляємо кнопку "+ Додати ще варіант"
        addBtn.onclick = () => {
            optionCount++;
            const div = document.createElement('div');
            div.className = 'mb-3 input-group';
            div.innerHTML = `
                <span class="input-group-text">${optionCount}</span>
                <input type="text" class="form-control" placeholder="Варіант ${optionCount}">
            `;
            addBtn.parentNode.insertBefore(div, addBtn);
        };

        form.onsubmit = (e) => {
            e.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки
            
            if (!this.model.currentUser) {
                alert('Помилка: Ви повинні увійти, щоб створити опитування!');
                window.location.href = 'login.html';
                return;
            }

            const q = form.querySelector('input[type="text"]').value;
            const opts = Array.from(form.querySelectorAll('.input-group input')).map(i => i.value).filter(v => v);
            
            const result = this.model.addPoll(q, opts);
            if (result.success) {
                alert('Опитування успішно створено!');
                window.location.href = 'profile.html';
            } else {
                alert(result.message);
            }
        };
    }

    // --- Перегляд всіх опитувань ---
    renderAllPolls() {
        const container = document.getElementById('polls-list');
        if (!this.model.polls || this.model.polls.length === 0) {
            container.innerHTML = '<p class="text-center text-muted mt-4">Опитувань поки немає. Створіть першим!</p>';
            return;
        }

        this.model.polls.forEach(poll => {
            // Захист від старих даних: якщо voters не існує, вважаємо його пустим масивом
            const voters = poll.voters || [];
            const currentUserEmail = this.model.currentUser ? this.model.currentUser.email : null;
            const hasVoted = currentUserEmail ? voters.includes(currentUserEmail) : false;
            
            const card = document.createElement('div');
            card.className = 'col-md-6 mb-4';
            card.innerHTML = `
                <div class="card shadow-sm poll-card h-100 border-primary">
                    <div class="card-body">
                        <h5 class="card-title text-primary">${poll.question}</h5>
                        <h6 class="card-subtitle mb-3 text-muted">Створив: ${poll.creatorName} <br><small>${poll.createdAt || 'Невідомо'}</small></h6>
                        <div id="opts-${poll.id}">
                            ${poll.options.map((o, i) => `
                                <button class="btn btn-outline-primary w-100 mb-2 text-start position-relative" 
                                    onclick="vote(${poll.id}, ${i})" ${hasVoted || !currentUserEmail ? 'disabled' : ''}>
                                    ${o.text} 
                                    <span class="badge bg-primary position-absolute end-0 me-2 mt-1">${o.votes}</span>
                                </button>
                            `).join('')}
                        </div>
                        ${hasVoted ? '<div class="alert alert-success mt-3 mb-0 py-2 text-center"><small>Ви вже проголосували</small></div>' : ''}
                        ${!currentUserEmail ? '<div class="alert alert-warning mt-3 mb-0 py-2 text-center"><small>Увійдіть, щоб голосувати</small></div>' : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

// Глобальна функція для голосування (щоб працювала з onclick в HTML)
window.vote = (id, idx) => {
    if (app.model.vote(id, idx)) {
        location.reload();
    } else {
        alert('Ви вже голосували або не увійшли в систему!');
    }
};

const app = new PollApp(new PollModel());