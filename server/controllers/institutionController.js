const InstitutionProfile = require('../models/InstitutionProfile');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const profile = await InstitutionProfile.findOne({ userId });
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ success: true, profile });

    } catch (error) {
        console.error('Error fetching institution profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

exports.createProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const existingProfile = await InstitutionProfile.findOne({ userId });
        if (existingProfile) {
            return res.status(400).json({ error: 'Profile already exists' });
        }

        const profile = new InstitutionProfile({
            userId,
            email: user.email,
            ...profileData
        });

        await profile.save();

        res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            profile
        });

    } catch (error) {
        console.error('Error creating institution profile:', error);
        res.status(500).json({
            error: 'Failed to create profile',
            details: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user || user.userType !== 'institution') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const profile = await InstitutionProfile.findOneAndUpdate(
            { userId },
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });

    } catch (error) {
        console.error('Error updating institution profile:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            details: error.message
        });
    }
};

module.exports = exports;