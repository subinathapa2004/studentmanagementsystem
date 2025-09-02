require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sms_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Student Schema
const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  semester: { type: Number, min: 1, max: 12 }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// API Routes
const api = express.Router();

// Get all students
api.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json({ data: students });
});

// Add student
api.post('/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ message: 'Student added', data: student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
api.patch('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if(!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student updated', data: student });
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
api.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if(!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.use('/api', api);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/*', (req,res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
