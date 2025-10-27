const Joi = require('joi');

// Teacher validation schema
const teacherValidation = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  location: Joi.object({
    state: Joi.string().required(),
    district: Joi.string().required(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
  }).required(),
  education: Joi.string().required(),
  experience: Joi.number().min(0).required(),
  subjects: Joi.array().items(Joi.string()).min(1).required(),
  otherSubjects: Joi.string().allow('').optional()
});

// Institution validation schema
const institutionValidation = Joi.object({
  institutionName: Joi.string().min(3).max(200).required(),
  type: Joi.string().valid('school', 'college', 'coaching', 'university', 'training_center').required(),
  email: Joi.string().email().required(),
  hrEmail: Joi.string().email().allow(null, '').optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  website: Joi.string().uri().allow(null, '').optional(),
  address: Joi.string().required(),
  location: Joi.object({
    state: Joi.string().required(),
    district: Joi.string().required(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
  }).required(),
  curriculumOffered: Joi.array().items(Joi.string()).min(1).required(),
  otherCurriculum: Joi.string().allow('').optional(),
  numberOfStudents: Joi.number().min(0).optional(),
  numberOfTeachers: Joi.number().min(0).optional(),
  avgClassSize: Joi.number().min(0).optional(),
  schoolType: Joi.string().valid('government', 'private', 'aided', 'international').required(),
  sectionsOffered: Joi.array().items(Joi.string()).min(1).required(),
  numberOfCampuses: Joi.number().min(1).max(25).optional(),
  jobDescription: Joi.string().allow(null, '').optional(),
  description: Joi.string().allow(null, '').optional()
});

const validateTeacher = (req, res, next) => {
  const { error } = teacherValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateInstitution = (req, res, next) => {
  const { error } = institutionValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateTeacher, validateInstitution };
