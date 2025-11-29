const multer = require('multer');
const path = require('path');  // ← ADD THIS IMPORT
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        console.log('📤 [Cloudinary] Preparing upload for:', file.fieldname);
        console.log('📤 [Cloudinary] File name:', file.originalname);
        console.log('📤 [Cloudinary] MIME type:', file.mimetype);
        
        const folder = file.fieldname === 'resume' ? 'eduhire/resumes' : 'eduhire/photos';
        
        // Use 'raw' resource_type for documents, 'image' for photos
        const resourceType = file.fieldname === 'resume' ? 'raw' : 'image';

        const params = {
            folder,
            resource_type: resourceType
        };
        
        console.log('📤 [Cloudinary] Upload params:', JSON.stringify(params));
        return params;
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Upload file check:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    try {
        // Allow PDF, DOC, DOCX for resumes
        if (file.fieldname === 'resume') {
            const allowedExtensions = /pdf|doc|docx/;
            const extname = path.extname(file.originalname).toLowerCase();
            const allowedMimetypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain' // Sometimes DOC comes as text/plain
            ];

            const isValidExt = allowedExtensions.test(extname);
            const isValidMimetype = allowedMimetypes.includes(file.mimetype);

            if (isValidExt || isValidMimetype) {
                console.log('Resume file accepted:', file.originalname);
                return cb(null, true);
            } else {
                console.warn('Resume rejected - extension:', extname, 'mimetype:', file.mimetype);
                return cb(new Error(`Invalid resume format. Please upload PDF or DOC file.`));
            }
        }

        // Allow JPG, PNG, GIF for photos
        if (file.fieldname === 'photo') {
            const allowedExtensions = /jpg|jpeg|png|gif/;
            const extname = path.extname(file.originalname).toLowerCase();
            const allowedMimetypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/jpg'
            ];

            const isValidExt = allowedExtensions.test(extname);
            const isValidMimetype = allowedMimetypes.includes(file.mimetype);

            if (isValidExt || isValidMimetype) {
                console.log('Photo file accepted:', file.originalname);
                return cb(null, true);
            } else {
                console.warn('Photo rejected - extension:', extname, 'mimetype:', file.mimetype);
                return cb(new Error(`Invalid photo format. Please upload JPG or PNG file.`));
            }
        }

        // If field name is neither resume nor photo
        console.warn('⚠️ Unknown field:', file.fieldname);
        cb(new Error(`Unknown file field: ${file.fieldname}`));

    } catch (error) {
        console.error('File filter error:', error);
        cb(error);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
