const Blog = require('../../models/Blogs');
const mongoose = require('mongoose');

// Mock mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation((definition) => ({
    pre: jest.fn(),
    methods: {},
    statics: {},
    _definition: definition
  })),
  model: jest.fn().mockReturnValue({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  }),
  SchemaTypes: {
    ObjectId: jest.fn()
  }
}));

describe('Blog Model', () => {
  let blogSchema;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Reset the module to trigger re-execution
    jest.resetModules();

    // Re-require the model to get fresh mocks
    require('../../models/Blogs');
  });

  it('should export a mongoose model', () => {
    expect(mongoose.model).toHaveBeenCalledWith('Blog', expect.any(Object), 'blogs');
  });

  it('should have required title field', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.title).toEqual({
      type: String,
      required: true
    });
  });

  it('should have required slug field with unique constraint', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.slug).toEqual({
      type: String,
      required: true,
      unique: true
    });
  });

  it('should have optional banner field', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.banner).toEqual({
      type: String
    });
  });

  it('should have optional description field', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.description).toEqual({
      type: String
    });
  });

  it('should have optional region field', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.region).toEqual({
      type: String
    });
  });

  it('should have location object with required lat/lng', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.location).toEqual({
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String }
    });
  });

  it('should have activities array', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.activities).toEqual([{
      name: { type: String }
    }]);
  });

  it('should have sightseeing array', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.sightseeing).toEqual([{
      name: { type: String }
    }]);
  });

  it('should have transport array', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.transport).toEqual([{
      name: { type: String }
    }]);
  });

  it('should have hotels array with price', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.hotels).toEqual([{
      name: { type: String },
      price: { type: String }
    }]);
  });

  it('should have quickInfo object', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.quickInfo).toEqual({
      weather: { type: String },
      bestSeason: { type: String },
      duration: { type: String },
      language: { type: String },
      distance: { type: String }
    });
  });

  it('should have faq array', () => {
    const schemaDefinition = mongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.faq).toEqual([{
      q: { type: String },
      a: { type: String }
    }]);
  });

  it('should have timestamps enabled', () => {
    const schemaOptions = mongoose.Schema.mock.calls[0][1];

    expect(schemaOptions).toEqual({ timestamps: true });
  });

  describe('Model Operations (Mocked)', () => {
    let mockBlogModel;

    beforeEach(() => {
      mockBlogModel = mongoose.model.mock.results[0].value;
    });

    it('should support finding blogs', async () => {
      const mockBlogs = [
        { _id: 'blog1', title: 'Blog 1', slug: 'blog-1' },
        { _id: 'blog2', title: 'Blog 2', slug: 'blog-2' }
      ];

      mockBlogModel.find.mockResolvedValue(mockBlogs);

      const result = await Blog.find();

      expect(result).toEqual(mockBlogs);
      expect(mockBlogModel.find).toHaveBeenCalled();
    });

    it('should support finding blog by slug', async () => {
      const mockBlog = { _id: 'blog1', title: 'Blog 1', slug: 'blog-1' };

      mockBlogModel.findOne.mockResolvedValue(mockBlog);

      const result = await Blog.findOne({ slug: 'blog-1' });

      expect(result).toEqual(mockBlog);
      expect(mockBlogModel.findOne).toHaveBeenCalledWith({ slug: 'blog-1' });
    });

    it('should support creating blogs', async () => {
      const blogData = { title: 'New Blog', slug: 'new-blog' };
      const mockCreatedBlog = { _id: 'blog3', ...blogData };

      mockBlogModel.create.mockResolvedValue(mockCreatedBlog);

      const result = await Blog.create(blogData);

      expect(result).toEqual(mockCreatedBlog);
      expect(mockBlogModel.create).toHaveBeenCalledWith(blogData);
    });

    it('should support finding blog by id', async () => {
      const mockBlog = { _id: 'blog1', title: 'Blog 1' };

      mockBlogModel.findById.mockResolvedValue(mockBlog);

      const result = await Blog.findById('blog1');

      expect(result).toEqual(mockBlog);
      expect(mockBlogModel.findById).toHaveBeenCalledWith('blog1');
    });

    it('should support updating blogs', async () => {
      const updateData = { title: 'Updated Blog' };
      const mockUpdatedBlog = { _id: 'blog1', title: 'Updated Blog' };

      mockBlogModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedBlog);

      const result = await Blog.findByIdAndUpdate('blog1', updateData);

      expect(result).toEqual(mockUpdatedBlog);
      expect(mockBlogModel.findByIdAndUpdate).toHaveBeenCalledWith('blog1', updateData);
    });

    it('should support deleting blogs', async () => {
      mockBlogModel.findByIdAndDelete.mockResolvedValue({ _id: 'blog1' });

      const result = await Blog.findByIdAndDelete('blog1');

      expect(result).toEqual({ _id: 'blog1' });
      expect(mockBlogModel.findByIdAndDelete).toHaveBeenCalledWith('blog1');
    });
  });
});