const express = require('express');
const router = express.Router();
const InstitutionProfile = require('../models/InstitutionProfile');
const upload = require('../middleware/upload');
const { validateInstitution } = require('../middleware/validation');

// Create institution profile
router.post('/', upload.single('jobDescriptionFile'), async (req, res, next) => {
    try {
        // Parse arrays if sent as strings
        let curriculumOffered = req.body.curriculumOffered;
        if (typeof curriculumOffered === 'string') {
            curriculumOffered = curriculumOffered.split(',').map(s => s.trim());
        }

        let sectionsOffered = req.body.sectionsOffered;
        if (typeof sectionsOffered === 'string') {
            sectionsOffered = sectionsOffered.split(',').map(s => s.trim());
        }

        let location = req.body.location;
        if (typeof location === 'string') {
            location = JSON.parse(location);
        }

        let socialMedia = req.body.socialMedia;
        if (typeof socialMedia === 'string') {
            socialMedia = JSON.parse(socialMedia);
        }

        const profileData = {
            ...req.body,
            location,
            curriculumOffered,
            sectionsOffered,
            socialMedia,
            jobDescriptionFile: req.file ? req.file.path : null,
            profileCompleted: true
        };

        const institution = new InstitutionProfile(profileData);
        await institution.save();

        res.status(201).json({
            message: 'Institution profile created successfully',
            institution
        });
    } catch (err) {
        next(err);
    }
});

// Get all institutions
router.get('/', async (req, res, next) => {
    try {
        const institutions = await InstitutionProfile.find().sort({ createdAt: -1 });
        res.json(institutions);
    } catch (err) {
        next(err);
    }
});

// Get single institution
router.get('/:id', async (req, res, next) => {
    try {
        const institution = await InstitutionProfile.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }
        res.json(institution);
    } catch (err) {
        next(err);
    }
});

// Update institution
router.put('/:id', upload.single('jobDescriptionFile'), async (req, res, next) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            updateData.jobDescriptionFile = req.file.path;
        }

        const institution = await InstitutionProfile.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }

        res.json({ message: 'Profile updated successfully', institution });
    } catch (err) {
        next(err);
    }
});

// Delete institution
router.delete('/:id', async (req, res, next) => {
    try {
        const institution = await InstitutionProfile.findByIdAndDelete(req.params.id);
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }
        res.json({ message: 'Profile deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
