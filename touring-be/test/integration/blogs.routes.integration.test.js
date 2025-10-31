const request = require('supertest');
const express = require('express');
const Blog = require('../../models/Blogs');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/blogs', require('../../routes/blogs'));

// Mock the Blog model
jest.mock('../../models/Blogs');

describe('Blogs Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/blogs/:slug', () => {
    it('should return blog when found', async () => {
      const mockBlog = {
        _id: 'blog123',
        title: 'Test Blog',
        slug: 'test-blog',
        description: 'Test description',
        banner: 'test.jpg',
        region: 'Vietnam',
        location: {
          lat: 10.7769,
          lng: 106.7009,
          address: 'Ho Chi Minh City'
        },
        activities: [{ name: 'Sightseeing' }],
        sightseeing: [{ name: 'Ben Thanh Market' }],
        transport: [{ name: 'Taxi' }],
        hotels: [{ name: 'Hotel A', price: '$100' }],
        quickInfo: {
          weather: 'Tropical',
          bestSeason: 'Dry season',
          duration: '3 days',
          language: 'Vietnamese',
          distance: '1000km'
        },
        faq: [{ q: 'Question?', a: 'Answer' }]
      };

      Blog.findOne.mockResolvedValue(mockBlog);

      const response = await request(app)
        .get('/api/blogs/test-blog')
        .expect(200);

      expect(Blog.findOne).toHaveBeenCalledWith({ slug: 'test-blog' });
      expect(response.body).toEqual(mockBlog);
    });

    it('should return 404 when blog not found', async () => {
      Blog.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/blogs/non-existent-blog')
        .expect(404);

      expect(Blog.findOne).toHaveBeenCalledWith({ slug: 'non-existent-blog' });
      expect(response.body).toEqual({ message: 'Blog not found' });
    });

    it('should handle database errors', async () => {
      Blog.findOne.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/blogs/test-blog')
        .expect(500);

      expect(response.body).toEqual({ error: 'Database connection failed' });
    });

    it('should handle special characters in slug', async () => {
      const mockBlog = {
        _id: 'blog123',
        title: 'Blog with Special Chars',
        slug: 'blog-with-special-chars-123'
      };

      Blog.findOne.mockResolvedValue(mockBlog);

      const response = await request(app)
        .get('/api/blogs/blog-with-special-chars-123')
        .expect(200);

      expect(Blog.findOne).toHaveBeenCalledWith({ slug: 'blog-with-special-chars-123' });
      expect(response.body).toEqual(mockBlog);
    });

    it('should handle empty slug parameter', async () => {
      Blog.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/blogs/')
        .expect(404);

      // Express should handle this as 404 since no route matches
    });

    it('should return blog with all populated fields', async () => {
      const mockBlog = {
        _id: 'blog123',
        title: 'Complete Blog',
        slug: 'complete-blog',
        description: 'Full description',
        banner: 'banner.jpg',
        region: 'Asia',
        location: {
          lat: 21.0285,
          lng: 105.8542,
          address: 'Hanoi, Vietnam'
        },
        activities: [
          { name: 'Hiking' },
          { name: 'Cultural tours' }
        ],
        sightseeing: [
          { name: 'Ho Chi Minh Mausoleum' },
          { name: 'Temple of Literature' }
        ],
        transport: [
          { name: 'Bus' },
          { name: 'Motorbike' }
        ],
        hotels: [
          { name: 'Luxury Hotel', price: '$200/night' },
          { name: 'Budget Hotel', price: '$50/night' }
        ],
        quickInfo: {
          weather: 'Monsoon',
          bestSeason: 'February-April',
          duration: '5-7 days',
          language: 'Vietnamese',
          distance: 'From major cities'
        },
        faq: [
          { q: 'What is the best time to visit?', a: 'Dry season (Nov-Mar)' },
          { q: 'Do I need a visa?', a: 'Yes, for most nationalities' }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      };

      Blog.findOne.mockResolvedValue(mockBlog);

      const response = await request(app)
        .get('/api/blogs/complete-blog')
        .expect(200);

      expect(response.body).toEqual(mockBlog);
      expect(response.body.activities).toHaveLength(2);
      expect(response.body.faq).toHaveLength(2);
      expect(response.body.hotels).toHaveLength(2);
    });
  });
});