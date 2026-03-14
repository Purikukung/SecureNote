import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // ฟังก์ชันดึงข้อมูลโน้ตจาก Backend
  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // ดึงข้อมูลเมื่อโหลดหน้าเว็บครั้งแรก
  useEffect(() => {
    fetchNotes();
  }, []);

  // ฟังก์ชันบันทึกโน้ตใหม่
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      
      if (response.ok) {
        setTitle('');
        setContent('');
        fetchNotes(); // อัปเดตรายการโน้ตใหม่
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <div className="App">
      <h1>SecureNote App</h1>
      
      <div className="note-form">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="หัวข้อ..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="เนื้อหา..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit">เพิ่มโน้ต</button>
        </form>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p>ยังไม่มีโน้ต</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;