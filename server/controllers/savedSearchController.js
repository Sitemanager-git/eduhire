// savedSearchController.js
const SavedSearch = require('../models/SavedSearch');
const Job = require('../models/Job');

// @desc    Save a new job search
// @route   POST /api/saved-searches
// @access  Private (Teachers only)
exports.saveSearch = async (req, res) => {
  try {
    const { name, filters } = req.body;
    const userId = req.user._id;

    // Validate
    if (!name || !filters) {
      return res.status(400).json({
        error: 'Name and filters are required'
      });
    }

    // Check if search name already exists for this user
    const existingSearch = await SavedSearch.findOne({
      userId,
      name
    });

    if (existingSearch) {
      return res.status(400).json({
        error: 'A saved search with this name already exists'
      });
    }

    // Create saved search
    const savedSearch = await SavedSearch.create({
      userId,
      name,
      filters
    });

    res.status(201).json({
      success: true,
      data: savedSearch
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      error: 'Failed to save search'
    });
  }
};

// @desc    Get all saved searches for current user
// @route   GET /api/saved-searches
// @access  Private (Teachers only)
exports.getSavedSearches = async (req, res) => {
  try {
    const userId = req.user._id;

    const savedSearches = await SavedSearch.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: savedSearches.length,
      data: savedSearches
    });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({
      error: 'Failed to retrieve saved searches'
    });
  }
};

// @desc    Delete a saved search
// @route   DELETE /api/saved-searches/:id
// @access  Private (Teachers only)
exports.deleteSavedSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const savedSearch = await SavedSearch.findOne({
      _id: id,
      userId
    });

    if (!savedSearch) {
      return res.status(404).json({
        error: 'Saved search not found'
      });
    }

    await savedSearch.deleteOne();

    res.json({
      success: true,
      message: 'Saved search deleted successfully'
    });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({
      error: 'Failed to delete saved search'
    });
  }
};

// @desc    Execute a saved search
// @route   GET /api/saved-searches/:id/execute
// @access  Private (Teachers only)
exports.executeSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const savedSearch = await SavedSearch.findOne({
      _id: id,
      userId
    });

    if (!savedSearch) {
      return res.status(404).json({
        error: 'Saved search not found'
      });
    }

    // Build query from saved filters
    const query = {};
    const filters = savedSearch.filters;

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.subject) {
      query.subject = filters.subject;
    }

    if (filters.level) {
      query.level = filters.level;
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.salaryMin || filters.salaryMax) {
      query['salary.min'] = {};
      if (filters.salaryMin) {
        query['salary.min'].$gte = filters.salaryMin;
      }
      if (filters.salaryMax) {
        query['salary.max'].$lte = filters.salaryMax;
      }
    }

    // Execute search
    const jobs = await Job.find(query)
      .populate('institutionid', 'institutionName location')
      .sort({ createdAt: -1 })
      .limit(50);

    // Update lastExecuted timestamp
    savedSearch.lastExecuted = Date.now();
    await savedSearch.save();

    res.json({
      success: true,
      count: jobs.length,
      data: {
        savedSearch,
        jobs
      }
    });
  } catch (error) {
    console.error('Execute saved search error:', error);
    res.status(500).json({
      error: 'Failed to execute saved search'
    });
  }
};
