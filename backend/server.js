const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อและสร้างฐานข้อมูล SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        // สร้างตาราง notes ถ้ายงไม่มี
        db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )`);
    }
});

// ดึง SECRET_TOKEN จากไฟล์ .env [cite: 22, 24]
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// ฟังก์ชัน Middleware สำหรับเช็ค Token [cite: 28, 29]
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === SECRET_TOKEN) {
        next(); // Token ถูกต้อง ให้ไปทำขั้นตอนถัดไป
    } else {
        res.status(401).json({ error: "Unauthorized: Invalid Token" }); // 
    }
};

app.get('/', (req, res) => res.send('Backend API is running correctly'));

// GET: ไม่ต้องมี Token ก็ดูได้ [cite: 27]
app.get('/api/notes', (req, res) => {
    db.all("SELECT * FROM notes", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST: ต้องมี Token ถึงจะเพิ่มได้ [cite: 28]
app.post('/api/notes', authenticate, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }
    
    db.run(`INSERT INTO notes (title, content) VALUES (?, ?)`, [title, content], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // this.lastID คือ ID ของโน้ตที่เพิ่งถูกสร้างขึ้นโดยอัตโนมัติ
        res.status(201).json({ id: this.lastID, title, content });
    });
});

// DELETE: ต้องมี Token ถึงจะลบได้ [cite: 29]
app.delete('/api/notes/:id', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.run(`DELETE FROM notes WHERE id = ?`, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // ถ้า this.changes เป็น 0 แสดงว่าหาโน้ตไม่เจอเพื่อลบ
        if (this.changes === 0) {
            return res.status(404).json({ error: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));