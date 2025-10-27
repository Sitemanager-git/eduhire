const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jobController = require("../controllers/jobController");
const jobSearchController = require('../controllers/jobSearchController');

const { authenticate } = require("../middleware/auth");
const { requirePremium } = require("../middleware/premiumAccess");
const { validateJob } = require('../middleware/validation');

const jobValidation = [
    check("title")
        .notEmpty().withMessage("Job title is required")
        .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    check("subject")
        .notEmpty().withMessage("Subject is required")
        .isLength({ min: 2 }).withMessage("Subject must be at least 2 characters"),
    check("level")
        .isIn(["primary", "secondary", "higher"])
        .withMessage("Invalid education level"),
    check("location")
        .notEmpty().withMessage("Location is required")
        .isLength({ min: 2 }).withMessage("Location must be at least 2 characters"),
    check("experience")
        .isInt({ min: 0 }).withMessage("Experience must be a positive number"),
    check("description")
        .notEmpty().withMessage("Job description is required")
        .isLength({ min: 50, max: 5000 }).withMessage("Description must be 50-5000 characters"),
    check("requirements")
        .notEmpty().withMessage("Requirements are required")
        .isLength({ min: 20 }).withMessage("Requirements must be at least 20 characters")
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(422).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

router.get('/search', jobSearchController.searchJobs);
router.get('/search/filters', jobSearchController.getSearchFilters);
router.get('/search/trending', jobSearchController.getTrendingJobs);
router.get('/search/:id', jobSearchController.getJobDetails);
router.get('/search/:id/similar', jobSearchController.getSimilarJobs);
router.post('/search/:id/view', jobSearchController.trackJobView);
router.get('/search/institution/:institutionId', jobSearchController.getJobsByInstitution);
router.get('/:id/details', jobSearchController.getJobDetails);

router.post("/create", authenticate, jobValidation, handleValidationErrors, jobController.createJob);
router.post("/", authenticate, jobValidation, handleValidationErrors, jobController.createJob);
router.get("/my-jobs", authenticate, jobController.getMyJobs);
router.get("/:id", authenticate, jobController.getJobById);
router.put("/:id", authenticate, jobValidation, handleValidationErrors, jobController.updateJob);
router.delete("/:id", authenticate, jobController.deleteJob);
router.get("/:jobId/applicants", authenticate, jobController.getJobApplicants);
router.post("/:id/duplicate", authenticate, jobController.duplicateJob);
router.get("/:jobId/export", authenticate, requirePremium("export"), jobController.exportApplicants);
router.get("/:jobId/analytics", authenticate, requirePremium("analytics"), jobController.getJobAnalytics);
router.post("/bulk-create", authenticate, requirePremium("bulk_posting"), jobController.bulkCreateJobs);

router.use((req, res) => {
    res.status(404).json({
        error: 'Job route not found',
        message: `No route found for ${req.method} ${req.path}`
    });
});

module.exports = router;
