const JobBookmark = require('../models/JobBookmark');
const Job = require('../models/Job');

/**
 * Bookmark a job
 * POST /api/bookmarks
 */
exports.bookmarkJob = async (req, res) => {
  try {
    const { jobId, notes, category } = req.body;
    const userId = req.user.id;

    // Validate job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already bookmarked
    const existing = await JobBookmark.findOne({ userId, jobId });
    if (existing) {
      return res.status(400).json({ 
        error: 'Job already bookmarked',
        bookmark: existing
      });
    }

    // Create bookmark
    const bookmark = new JobBookmark({
      userId,
      jobId,
      notes: notes || '',
      category: category || 'interested'
    });

    await bookmark.save();

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully',
      bookmark
    });

  } catch (error) {
    console.error('Bookmark job error:', error);
    res.status(500).json({
      error: 'Failed to bookmark job',
      message: error.message
    });
  }
};

/**
 * Remove bookmark
 * DELETE /api/bookmarks/:jobId
 */
exports.removeBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const bookmark = await JobBookmark.findOneAndDelete({ userId, jobId });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      error: 'Failed to remove bookmark',
      message: error.message
    });
  }
};

/**
 * Get user's bookmarked jobs
 * GET /api/bookmarks/my
 */
exports.getMyBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    const query = { userId };
    if (category) {
      query.category = category;
    }

    const bookmarks = await JobBookmark.find(query)
      .populate({
        path: 'jobId',
        select: 'title subject level location salary experience employmentType institutionid postedAt expiresAt',
        populate: {
          path: 'institutionid',
          select: 'institutionName type location'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out bookmarks where job was deleted
    const validBookmarks = bookmarks.filter(b => b.jobId);

    res.json({
      success: true,
      count: validBookmarks.length,
      bookmarks: validBookmarks
    });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookmarks',
      message: error.message
    });
  }
};

/**
 * Check if job is bookmarked
 * GET /api/bookmarks/check/:jobId
 */
exports.checkBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const bookmark = await JobBookmark.findOne({ userId, jobId });

    res.json({
      success: true,
      isBookmarked: !!bookmark,
      bookmark: bookmark || null
    });

  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({
      error: 'Failed to check bookmark status',
      message: error.message
    });
  }
};

module.exports = exports;
