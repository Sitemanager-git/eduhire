// models/InstitutionProfile.js
const mongoose = require('mongoose');

const InstitutionProfileSchema = new mongoose.Schema({
    // Basic Details
    institutionName: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['school', 'college', 'coaching', 'university', 'training_center'],
        required: true
    },

    // Contact Info
    email: {
        type: String,
        required: true,
        unique: true
    },
    hrEmail: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        required: true
    },
    website: {
        type: String,
        default: null
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        linkedin: String,
        instagram: String
    },

    // Location
    address: {
        type: String,
        required: true
    },
    location: {
        state: { type: String, required: true },
        district: { type: String, required: true },
        pincode: { type: String, required: true, match: /^[0-9]{6}$/ }
    },

    // Curriculum (multi-select)
    curriculumOffered: {
        type: [String],
        default: []
    },
    otherCurriculum: {
        type: String,
        default: ''
    },

    // Institution Stats
    numberOfStudents: {
        type: Number,
        default: 0
    },
    numberOfTeachers: {
        type: Number,
        default: 0
    },
    avgClassSize: {
        type: Number,
        default: 0
    },
    schoolType: {
        type: String,
        enum: ['government', 'private', 'aided', 'international'],
        required: true
    },

    // Sections Offered (multi-select)
    sectionsOffered: {
        type: [String],
        default: []
    },

    // Number of Campuses
    numberOfCampuses: {
        type: Number,
        default: 1,
        min: 1,
        max: 25
    },

    // Job Details
    jobDescription: {
        type: String,
        default: null
    },
    jobDescriptionFile: {
        type: String, // Cloudinary URL
        default: null
    },

    description: {
        type: String,
        default: null
    },

    // Profile completion
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('InstitutionProfile', InstitutionProfileSchema);
