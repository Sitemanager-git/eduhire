// models/TeacherProfile.js
const mongoose = require('mongoose');

const TeacherProfileSchema = new mongoose.Schema({
    // Personal Info
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },

    // Location
    location: {
        state: { type: String, required: true },
        district: { type: String, required: true },
        pincode: { type: String, required: true, match: /^[0-9]{6}$/ }
    },

    // Education & Experience
    education: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0,
        min: 0
    },

    // Subjects (30 options + others)
    subjects: {
        type: [String],
        default: []
    },
    otherSubjects: {
        type: String,
        default: ''
    },

    // Files
    resume: {
        type: String, // Cloudinary URL
        default: null
    },
    photo: {
        type: String, // Cloudinary URL
        default: null
    },

    // Profile completion status
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('TeacherProfile', TeacherProfileSchema);
