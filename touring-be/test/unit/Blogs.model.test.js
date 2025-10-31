
let Blog;
let mongoose;

// Use the dedicated __mocks__/mongoose.js for all mongoose mocking
jest.mock('mongoose');


describe('Blog Model', () => {
  let blogSchema;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Always require mongoose and Blog after mocks are set up
    mongoose = require('mongoose');
    Blog = require('../../models/Blogs');
  });

  it('should export a mongoose model', () => {
    expect(mongoose.model).toHaveBeenCalledWith('Blog', expect.any(Object), 'blogs');
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