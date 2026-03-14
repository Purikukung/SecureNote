import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. State Management (ตามโจทย์ Path B) [cite: 38]
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // เปลี่ยนมาใช้ API และ Token ของอาจารย์
  const API_URL = 'https://app-tracking.pockethost.io/api/collections/notes/records'; 
  const SECRET_TOKEN = 'Bearer 20260301eink'; // เพิ่มคำว่า Bearer นำหน้าตามที่อาจารย์ให้มา

  // 2. Fetch API: GET (ดึงโน้ตทั้งหมดมาแสดง) [cite: 27, 39]
  const fetchNotes = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': SECRET_TOKEN // ส่ง Token ตอนดึงข้อมูลด้วย (PocketHost มักจะบังคับ)
        }
      });
      const data = await response.json();
      // PocketHost จะส่งข้อมูลจริงมาใน property ชื่อ items
      setNotes(data.items || data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // 3. Fetch API: POST (สร้างโน้ตใหม่ พร้อมส่ง Authorization) [cite: 28, 77]
  const addNote = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // บอกว่าเป็น JSON [cite: 27]
          'Authorization': SECRET_TOKEN // ส่ง Token เพื่อความปลอดภัย [cite: 28, 77]
        },
        body: JSON.stringify({ title, content, user_id: 2 }) // เพิ่ม user_id: 2 ตามโจทย์อาจารย์
      });

      if (response.ok) { // ใช้ response.ok (ครอบคลุมสถานะ 200-299) เผื่อ API ส่งกลับมาเป็น 200
        setTitle(''); // ล้างช่อง Input
        setContent('');
        setErrorMessage('');
        fetchNotes(); // อัปเดตรายการใหม่
      } else if (response.status === 401) {
        setErrorMessage('Unauthorized: รหัสลับไม่ถูกต้อง!'); // [cite: 41]
      }
    } catch (err) {
      setErrorMessage('ไม่สามารถเชื่อมต่อกับ Server ได้');
    }
  };

  // Wrapper function สำหรับ form submission
  const handleAddNote = (e) => {
    e.preventDefault(); // ป้องกันการโหลดหน้าเว็บใหม่
    addNote();
  };

  // 4. Fetch API: DELETE (ลบโน้ตตาม ID พร้อมส่ง Authorization) 
  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE', // ระบุ Method สำหรับการลบ 
        headers: {
          'Authorization': SECRET_TOKEN // ต้องส่ง Token ตามโจทย์ 
        }
      });

      if (response.ok) {
        fetchNotes(); // เมื่อลบสำเร็จ ให้ดึงข้อมูลใหม่มาแสดงทันที [cite: 38]
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'ลบโน้ตไม่สำเร็จ');
      }
    } catch (err) {
      setErrorMessage('ไม่สามารถเชื่อมต่อกับ Server เพื่อลบข้อมูลได้');
    }
  };
  
  return (
    <div className="container">
      <h1>SecureNote 🔒</h1>
      
      {/* ส่วนแสดง Error Message (ตามโจทย์ข้อ 4.1) [cite: 41] */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form className="note-form" onSubmit={handleAddNote}>
        <input 
          type="text" 
          placeholder="หัวข้อโน้ต" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea 
          placeholder="เนื้อหาโน้ต" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">บันทึกโน้ต</button>
      </form>

      <hr />

      <div className="notes-list">
        <h2>โน้ตของคุณ</h2>
        {notes.length === 0 ? <p>ยังไม่มีข้อมูล...</p> : notes.map((note) => (
          <div key={note.id} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.content}</p>

            <button 
              onClick={() => deleteNote(note.id)} 
              className="delete-btn"
            >
              ลบโน้ต
            </button>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;