const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Review = require('../models/Review');
const User = require('../models/User');

describe('Review System Tests', () => {
  let teacherToken, institutionToken;
  let teacherId, institutionId;

  beforeAll(async () => {
    // Setup test database connection
    await mongoose.connect(process.env.TEST_MONGO_URI);
    
    // Create test users and get tokens
    // ... authentication setup code ...
  });

  afterAll(async () => {
    await Review.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/reviews - Submit Review', () => {
    it('should allow teacher to review institution', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          rating: 4,
          comment: 'Great institution with good facilities',
          reviewedEntityId: institutionId,
          reviewedEntityType: 'Institution'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.review).toHaveProperty('rating', 4);
    });

    it('should prevent duplicate reviews', async () => {
      // Submit first review
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          rating: 4,
          comment: 'First review',
          reviewedEntityId: institutionId,
          reviewedEntityType: 'Institution'
        });

      // Attempt duplicate
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          rating: 5,
          comment: 'Second review attempt',
          reviewedEntityId: institutionId,
          reviewedEntityType: 'Institution'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('already reviewed');
    });

    it('should enforce access control - teacher cannot review teacher', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          rating: 4,
          comment: 'Review for another teacher',
          reviewedEntityId: teacherId,
          reviewedEntityType: 'Teacher'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should validate rating range', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          rating: 6,
          comment: 'Invalid rating',
          reviewedEntityId: institutionId,
          reviewedEntityType: 'Institution'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/reviews/:entityType/:entityId', () => {
    it('should fetch reviews with statistics', async () => {
      const res = await request(app)
        .get(`/api/reviews/Institution/${institutionId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('reviews');
      expect(res.body).toHaveProperty('statistics');
      expect(res.body.statistics).toHaveProperty('averageRating');
    });
  });
});
