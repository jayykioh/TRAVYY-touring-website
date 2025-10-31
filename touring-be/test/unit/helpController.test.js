const helpController = require('../../controller/helpController');
const HelpArticle = require('../../models/HelpArticle');
const HelpCategory = require('../../models/HelpCategory');
const HelpFeedback = require('../../models/HelpFeedback');

// Mock dependencies
jest.mock('../../models/HelpArticle', () => ({
  find: jest.fn(() => ({
    populate: jest.fn(() => ({
      populate: jest.fn(() => ({
        limit: jest.fn(() => ({
          sort: jest.fn()
        }))
      }))
    }))
  })),
  findOne: jest.fn(() => ({
    populate: jest.fn(() => ({
      populate: jest.fn()
    }))
  })),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock('../../models/HelpCategory', () => ({
  find: jest.fn(() => ({
    populate: jest.fn()
  })),
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../models/HelpFeedback', () => ({
  find: jest.fn(() => ({
    populate: jest.fn()
  })),
  findById: jest.fn(() => ({
    populate: jest.fn()
  })),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

describe('Help Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      userId: 'user123',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories with populated article count', async () => {
      const mockCategories = [
        { _id: 'cat1', name: 'Category 1', articleCount: 5 },
        { _id: 'cat2', name: 'Category 2', articleCount: 3 }
      ];

      HelpCategory.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCategories)
      });

      await helpController.getCategories(req, res);

      expect(HelpCategory.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });

    it('should handle database errors', async () => {
      HelpCategory.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await helpController.getCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('getFeaturedArticles', () => {
    it('should return featured articles', async () => {
      const mockArticles = [
        { _id: 'art1', title: 'Featured Article 1', isFeatured: true },
        { _id: 'art2', title: 'Featured Article 2', isFeatured: true }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockArticles)
      };

      HelpArticle.find.mockReturnValue(mockQuery);

      await helpController.getFeaturedArticles(req, res);

      expect(HelpArticle.find).toHaveBeenCalledWith({ isFeatured: true });
      expect(mockQuery.limit).toHaveBeenCalledWith(6);
      expect(res.json).toHaveBeenCalledWith(mockArticles);
    });

    it('should handle database errors', async () => {
      HelpArticle.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await helpController.getFeaturedArticles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return articles for valid category', async () => {
      const mockCategory = { _id: 'cat1', name: 'Test Category', slug: 'test-category' };
      const mockArticles = [
        { _id: 'art1', title: 'Article 1', category: 'cat1' },
        { _id: 'art2', title: 'Article 2', category: 'cat1' }
      ];

      HelpCategory.findOne.mockResolvedValue(mockCategory);
      HelpArticle.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockArticles)
      });

      req.params.category = 'test-category';

      await helpController.getArticlesByCategory(req, res);

      expect(HelpCategory.findOne).toHaveBeenCalledWith({ slug: 'test-category' });
      expect(HelpArticle.find).toHaveBeenCalledWith({ category: 'cat1' });
      expect(res.json).toHaveBeenCalledWith({ category: mockCategory, articles: mockArticles });
    });

    it('should return 404 for non-existent category', async () => {
      HelpCategory.findOne.mockResolvedValue(null);

      req.params.category = 'non-existent';

      await helpController.getArticlesByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });
  });

  describe('getArticle', () => {
    it('should return article by slug', async () => {
      const mockArticle = {
        _id: 'art1',
        title: 'Test Article',
        slug: 'test-article',
        category: 'cat1'
      };

      HelpArticle.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockArticle)
      });

      req.params.slug = 'test-article';

      await helpController.getArticle(req, res);

      expect(HelpArticle.findOne).toHaveBeenCalledWith({ slug: 'test-article' });
      expect(res.json).toHaveBeenCalledWith(mockArticle);
    });

    it('should return 404 for non-existent article', async () => {
      HelpArticle.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      req.params.slug = 'non-existent';

      await helpController.getArticle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Article not found' });
    });
  });

  describe('searchArticles', () => {
    it('should search articles by query', async () => {
      const mockResults = [
        { _id: 'art1', title: 'Search Result 1' },
        { _id: 'art2', title: 'Search Result 2' }
      ];

      HelpArticle.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockResults)
      });

      req.query.q = 'search term';

      await helpController.searchArticles(req, res);

      expect(HelpArticle.find).toHaveBeenCalledWith({ $text: { $search: 'search term' } });
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('should handle empty search query', async () => {
      HelpArticle.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      req.query.q = '';

      await helpController.searchArticles(req, res);

      expect(HelpArticle.find).toHaveBeenCalledWith({ $text: { $search: '' } });
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('submitFeedback', () => {
    it('should create feedback successfully', async () => {
      const mockFeedback = {
        _id: 'fb1',
        articleId: 'art1',
        userId: 'user123',
        helpful: true,
        comment: 'Great article!'
      };

      HelpFeedback.create.mockResolvedValue(mockFeedback);

      req.params.articleId = 'art1';
      req.body = { helpful: true, comment: 'Great article!' };

      await helpController.submitFeedback(req, res);

      expect(HelpFeedback.create).toHaveBeenCalledWith({
        articleId: 'art1',
        userId: 'user123',
        helpful: true,
        comment: 'Great article!',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, feedback: mockFeedback });
    });

    it('should handle anonymous feedback', async () => {
      req.userId = null;
      HelpFeedback.create.mockResolvedValue({ _id: 'fb1', userId: null });

      req.params.articleId = 'art1';
      req.body = { helpful: false };

      await helpController.submitFeedback(req, res);

      expect(HelpFeedback.create).toHaveBeenCalledWith({
        articleId: 'art1',
        userId: null,
        helpful: false,
        comment: undefined,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });
    });
  });

  describe('createArticle', () => {
    it('should create article successfully', async () => {
      const mockArticle = { _id: 'art1', title: 'New Article' };
      HelpArticle.create.mockResolvedValue(mockArticle);

      req.body = { title: 'New Article', content: 'Content' };

      await helpController.createArticle(req, res);

      expect(HelpArticle.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockArticle);
    });
  });

  describe('updateArticle', () => {
    it('should update article successfully', async () => {
      const mockArticle = { _id: 'art1', title: 'Updated Article' };
      HelpArticle.findByIdAndUpdate.mockResolvedValue(mockArticle);

      req.params.id = 'art1';
      req.body = { title: 'Updated Article' };

      await helpController.updateArticle(req, res);

      expect(HelpArticle.findByIdAndUpdate).toHaveBeenCalledWith('art1', req.body, { new: true });
      expect(res.json).toHaveBeenCalledWith(mockArticle);
    });

    it('should return 404 for non-existent article', async () => {
      HelpArticle.findByIdAndUpdate.mockResolvedValue(null);

      req.params.id = 'nonexistent';

      await helpController.updateArticle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      HelpArticle.findByIdAndDelete.mockResolvedValue({ _id: 'art1' });

      req.params.id = 'art1';

      await helpController.deleteArticle(req, res);

      expect(HelpArticle.findByIdAndDelete).toHaveBeenCalledWith('art1');
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('getAllFeedback', () => {
    it('should return all feedback', async () => {
      const mockFeedbacks = [
        { _id: 'fb1', articleId: 'art1', helpful: true },
        { _id: 'fb2', articleId: 'art2', helpful: false }
      ];

      HelpFeedback.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockFeedbacks)
      });

      await helpController.getAllFeedback(req, res);

      expect(HelpFeedback.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockFeedbacks);
    });
  });

  describe('getFeedbackById', () => {
    it('should return feedback by id', async () => {
      const mockFeedback = { _id: 'fb1', articleId: 'art1', helpful: true };

      HelpFeedback.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockFeedback)
      });

      req.params.id = 'fb1';

      await helpController.getFeedbackById(req, res);

      expect(HelpFeedback.findById).toHaveBeenCalledWith('fb1');
      expect(res.json).toHaveBeenCalledWith(mockFeedback);
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update feedback status', async () => {
      const mockFeedback = { _id: 'fb1', status: 'reviewed', responseMessage: 'Thank you' };

      HelpFeedback.findByIdAndUpdate.mockResolvedValue(mockFeedback);

      req.params.id = 'fb1';
      req.body = { status: 'reviewed', responseMessage: 'Thank you' };

      await helpController.updateFeedbackStatus(req, res);

      expect(HelpFeedback.findByIdAndUpdate).toHaveBeenCalledWith(
        'fb1',
        { status: 'reviewed', responseMessage: 'Thank you' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockFeedback);
    });
  });
});