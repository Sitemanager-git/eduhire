const express = require('express');
const router = express.Router();
const TeacherProfile = require('../models/TeacherProfile');
const upload = require('../middleware/upload');
const { validateTeacher } = require('../middleware/validation');

// Create teacher profile with file upload
router.post('/', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), async (req, res, next) => {
    try {
        // Parse subjects if sent as string
        let subjects = req.body.subjects;
        if (typeof subjects === 'string') {
            subjects = subjects.split(',').map(s => s.trim());
        }

        // Parse location if sent as string
        let location = req.body.location;
        if (typeof location === 'string') {
            location = JSON.parse(location);
        }

        const profileData = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            location: location,
            education: req.body.education,
            experience: parseInt(req.body.experience) || 0,
            subjects: subjects,
            otherSubjects: req.body.otherSubjects || '',
            resume: req.files?.resume ? req.files.resume[0].path : null,
            photo: req.files?.photo ? req.files.photo[0].path : null,
            profileCompleted: true
        };

        const profile = new TeacherProfile(profileData);
        await profile.save();

        res.status(201).json({
            message: 'Teacher profile created successfully',
            profile
        });
    } catch (err) {
        next(err);
    }
});

// Get all teacher profiles
router.get('/', async (req, res, next) => {
    try {
        const teachers = await TeacherProfile.find().sort({ createdAt: -1 });
        res.json(teachers);
    } catch (err) {
        next(err);
    }
});

// Get single teacher profile
router.get('/:id', async (req, res, next) => {
    try {
        const teacher = await TeacherProfile.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (err) {
        next(err);
    }
});

// Update teacher profile
router.put('/:id', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const updateData = { ...req.body };

        if (req.files?.resume) {
            updateData.resume = req.files.resume[0].path;
        }
        if (req.files?.photo) {
            updateData.photo = req.files.photo[0].path;
        }

        const teacher = await TeacherProfile.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.json({ message: 'Profile updated successfully', teacher });
    } catch (err) {
        next(err);
    }
});

// Delete teacher profile
router.delete('/:id', async (req, res, next) => {
    try {
        const teacher = await TeacherProfile.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json({ message: 'Profile deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
