const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Дозволяє серверу розуміти JSON від клієнта

// Підключення до бази даних (створиться файл database.db)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Помилка підключення до БД:', err.message);
    else console.log('Підключено до бази даних SQLite.');
});

// Створення таблиць, якщо їх ще немає
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        gender TEXT,
        dob TEXT,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creatorName TEXT,
        creatorEmail TEXT,
        question TEXT,
        options TEXT, -- Зберігатимемо як JSON-рядок
        voters TEXT,  -- Зберігатимемо масив email-ів як JSON-рядок
        createdAt TEXT
    )`);
});

// --- API МАРШРУТИ ---

// 1. Реєстрація
app.post('/api/register', (req, res) => {
    const { name, email, gender, dob, password } = req.body;
    db.run(`INSERT INTO users (name, email, gender, dob, password) VALUES (?, ?, ?, ?, ?)`,
        [name, email, gender, dob, password],
        function (err) {
            if (err) return res.status(400).json({ success: false, message: 'Користувач з таким email вже існує' });
            res.json({ success: true, user: { id: this.lastID, name, email, gender, dob } });
        }
    );
});

// 2. Вхід (Логін)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT id, name, email, gender, dob FROM users WHERE email = ? AND password = ?`, [email, password], (err, user) => {
        if (err || !user) return res.status(401).json({ success: false, message: 'Невірний email або пароль' });
        res.json({ success: true, user });
    });
});

// 3. Створення опитування
app.post('/api/polls', (req, res) => {
    const { creatorName, creatorEmail, question, options } = req.body;
    const createdAt = new Date().toLocaleString();
    
    // Перевірка ліміту 5 опитувань
    db.get(`SELECT COUNT(*) as count FROM polls WHERE creatorEmail = ?`, [creatorEmail], (err, row) => {
        if (row.count >= 5) return res.status(403).json({ success: false, message: 'Ліміт 5 опитувань вичерпано!' });

        const optionsJson = JSON.stringify(options.map(opt => ({ text: opt, votes: 0 })));
        const votersJson = JSON.stringify([]);

        db.run(`INSERT INTO polls (creatorName, creatorEmail, question, options, voters, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [creatorName, creatorEmail, question, optionsJson, votersJson, createdAt],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: 'Помилка створення опитування' });
                res.json({ success: true, message: 'Опитування створено' });
            }
        );
    });
});

// 4. Отримання всіх опитувань
app.get('/api/polls', (req, res) => {
    db.all(`SELECT * FROM polls ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        
        // Перетворюємо JSON-рядки назад у масиви для клієнта
        const polls = rows.map(row => ({
            ...row,
            options: JSON.parse(row.options),
            voters: JSON.parse(row.voters)
        }));
        res.json(polls);
    });
});

// 5. Голосування
app.post('/api/polls/vote', (req, res) => {
    const { pollId, optionIndex, userEmail } = req.body;

    db.get(`SELECT options, voters FROM polls WHERE id = ?`, [pollId], (err, row) => {
        if (err || !row) return res.status(404).json({ success: false, message: 'Опитування не знайдено' });

        let options = JSON.parse(row.options);
        let voters = JSON.parse(row.voters);

        if (voters.includes(userEmail)) {
            return res.status(403).json({ success: false, message: 'Ви вже голосували' });
        }

        options[optionIndex].votes++;
        voters.push(userEmail);

        db.run(`UPDATE polls SET options = ?, voters = ? WHERE id = ?`, 
            [JSON.stringify(options), JSON.stringify(voters), pollId], 
            (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Помилка голосування' });
                res.json({ success: true });
            }
        );
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});