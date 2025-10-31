const authController = require('../../controller/auth.controller');const authController = require('../../controller/auth.controller');const authController = require('../../controller/auth.controller');const authController = require('../../controller/auth.controller');const authController = require('../../controller/auth.controller');

const User = require('../../models/Users');

const { signAccess, signRefresh, newId } = require('../../utils/jwt');const User = require('../../models/Users');

const { sendMail } = require('../../utils/emailService');

const axios = require('axios');const { signAccess, signRefresh, newId } = require('../../utils/jwt');const User = require('../../models/Users');

const bcrypt = require('bcryptjs');

const { sendMail } = require('../../utils/emailService');

// Mock dependencies

jest.mock('../../models/Users', () => ({const axios = require('axios');const { signAccess, signRefresh, newId } = require('../../utils/jwt');const User = require('../../models/Users');const User = require('../../models/Users');

  exists: jest.fn(),

  findOne: jest.fn(),const bcrypt = require('bcryptjs');

  findById: jest.fn(),

  create: jest.fn(),const { sendMail } = require('../../utils/emailService');

}));

jest.mock('../../utils/jwt');// Mock dependencies

jest.mock('../../utils/emailService', () => ({

  sendMail: jest.fn(),jest.mock('../../models/Users', () => ({const axios = require('axios');const { signAccess, signRefresh, newId } = require('../../utils/jwt');const { signAccess, signRefresh, newId } = require('../../utils/jwt');

}));

jest.mock('axios');  exists: jest.fn(),

jest.mock('bcryptjs');

  findOne: jest.fn(),const bcrypt = require('bcryptjs');

describe('Auth Controller', () => {

  let req, res;  findById: jest.fn(),



  beforeEach(() => {  create: jest.fn(),const { sendMail } = require('../../utils/emailService');const { sendMail } = require('../../utils/emailService');

    req = {

      body: {},}));

      user: { sub: 'userId', _id: 'userId' },

      ip: '127.0.0.1',jest.mock('../../utils/jwt');// Mock dependencies

      get: jest.fn(() => 'test-user-agent'),

    };jest.mock('../../utils/emailService', () => ({

    res = {

      status: jest.fn().mockReturnThis(),  sendMail: jest.fn(),jest.mock('../../models/Users', () => ({const axios = require('axios');const axios = require('axios');

      json: jest.fn(),

      cookie: jest.fn(),}));

    };

    jest.clearAllMocks();jest.mock('axios');  exists: jest.fn(),

  });

jest.mock('bcryptjs');

  describe('normalizePhone', () => {

    it('should normalize Vietnamese phone number starting with 84', () => {  findOne: jest.fn(),const bcrypt = require('bcryptjs');const bcrypt = require('bcryptjs');

      const { normalizePhone } = authController;

      expect(normalizePhone('84123456789')).toBe('0123456789');describe('Auth Controller', () => {

    });

  let req, res;  findById: jest.fn(),

    it('should return original phone if already starts with 0', () => {

      const { normalizePhone } = authController;

      expect(normalizePhone('0123456789')).toBe('0123456789');

    });  beforeEach(() => {  create: jest.fn(),



    it('should return empty string for null/undefined', () => {    req = {

      const { normalizePhone } = authController;

      expect(normalizePhone(null)).toBe('');      body: {},}));

      expect(normalizePhone(undefined)).toBe('');

      expect(normalizePhone('')).toBe('');      user: { sub: 'userId', _id: 'userId' },

    });

  });      ip: '127.0.0.1',jest.mock('../../utils/jwt');// Mock dependencies// Mock dependencies



  describe('register', () => {      get: jest.fn(() => 'test-user-agent'),

    it('should register user successfully', async () => {

      req.body = {    };jest.mock('../../utils/emailService', () => ({

        email: 'test@example.com',

        password: 'password123',    res = {

        name: 'Test User',

        phone: '84123456789',      status: jest.fn().mockReturnThis(),  sendMail: jest.fn(),jest.mock('../../models/Users', () => ({jest.mock('../../models/Users', () => ({

        provinceId: '01',

        wardId: '001'      json: jest.fn(),

      };

      cookie: jest.fn(),}));

      User.exists.mockResolvedValue(false);

      User.create.mockResolvedValue({    };

        id: 'newUserId',

        email: 'test@example.com',    jest.clearAllMocks();jest.mock('axios');  exists: jest.fn(),  exists: jest.fn(),

        role: 'Traveler',

        name: 'Test User',  });

        username: undefined,

        phone: '0123456789',jest.mock('bcryptjs');

        location: { provinceId: '01', wardId: '001', addressLine: '' }

      });  describe('normalizePhone', () => {

      bcrypt.hash.mockResolvedValue('hashedPassword');

      signAccess.mockReturnValue('accessToken');    it('should normalize Vietnamese phone number starting with 84', () => {  findOne: jest.fn(),  findOne: jest.fn(),

      signRefresh.mockReturnValue('refreshToken');

      newId.mockReturnValue('jti');      const { normalizePhone } = authController;



      await authController.register(req, res);      expect(normalizePhone('84123456789')).toBe('0123456789');describe('Auth Controller', () => {



      expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });    });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      expect(User.create).toHaveBeenCalledWith({  let req, res;  findById: jest.fn(),  findById: jest.fn(),

        email: 'test@example.com',

        password: 'hashedPassword',    it('should return original phone if already starts with 0', () => {

        name: 'Test User',

        username: undefined,      const { normalizePhone } = authController;

        phone: '0123456789',

        role: 'Traveler',      expect(normalizePhone('0123456789')).toBe('0123456789');

        location: {

          provinceId: '01',    });  beforeEach(() => {  create: jest.fn(),  create: jest.fn(),

          wardId: '001',

          addressLine: '',

        },

      });    it('should return empty string for null/undefined', () => {    req = {

      expect(signAccess).toHaveBeenCalledWith({ id: 'newUserId', role: 'Traveler' });

      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'newUserId' });      const { normalizePhone } = authController;

      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      expect(res.status).toHaveBeenCalledWith(201);      expect(normalizePhone(null)).toBe('');      body: {},}));}));

      expect(res.json).toHaveBeenCalledWith({

        accessToken: 'accessToken',      expect(normalizePhone(undefined)).toBe('');

        user: {

          _id: 'newUserId',      expect(normalizePhone('')).toBe('');      user: { sub: 'userId', _id: 'userId' },

          email: 'test@example.com',

          role: 'Traveler',    });

          name: 'Test User',

          username: '',  });      ip: '127.0.0.1',jest.mock('../../utils/jwt');jest.mock('../../utils/jwt');

          phone: '0123456789',

          location: { provinceId: '01', wardId: '001', addressLine: '' },

        },

      });  describe('register', () => {      get: jest.fn(() => 'test-user-agent'),

    });

    it('should register user successfully', async () => {

    it('should return validation error for invalid email', async () => {

      req.body = {      req.body = {    };jest.mock('../../utils/emailService', () => ({jest.mock('../../utils/emailService', () => ({

        email: 'invalid-email',

        password: 'password123',        email: 'test@example.com',

        provinceId: '01',

        wardId: '001'        password: 'password123',    res = {

      };

        name: 'Test User',

      await authController.register(req, res);

        phone: '84123456789',      status: jest.fn().mockReturnThis(),  sendMail: jest.fn(),  sendMail: jest.fn(),

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        provinceId: '01',

        error: 'VALIDATION_ERROR',

        message: expect.any(String),        wardId: '001'      json: jest.fn(),

      });

    });      };



    it('should return error for taken email', async () => {      cookie: jest.fn(),}));}));

      req.body = {

        email: 'taken@example.com',      User.exists.mockResolvedValue(false);

        password: 'password123',

        provinceId: '01',      User.create.mockResolvedValue({    };

        wardId: '001'

      };        id: 'newUserId',



      User.exists.mockResolvedValue(true);        email: 'test@example.com',    jest.clearAllMocks();jest.mock('axios');jest.mock('axios');



      await authController.register(req, res);        role: 'Traveler',



      expect(res.status).toHaveBeenCalledWith(409);        name: 'Test User',  });

      expect(res.json).toHaveBeenCalledWith({

        error: 'EMAIL_TAKEN',        username: undefined,

        field: 'email',

        message: 'Email đã được sử dụng.',        phone: '0123456789',jest.mock('bcryptjs');jest.mock('bcryptjs');

      });

    });        location: { provinceId: '01', wardId: '001', addressLine: '' }

  });

      });  describe('normalizePhone', () => {

  describe('login', () => {

    it('should login user successfully', async () => {      bcrypt.hash.mockResolvedValue('hashedPassword');

      req.body = {

        email: 'test@example.com',      signAccess.mockReturnValue('accessToken');    it('should normalize Vietnamese phone number starting with 84', () => {

        password: 'password123'

      };      signRefresh.mockReturnValue('refreshToken');



      const mockUser = {      newId.mockReturnValue('jti');      const { normalizePhone } = authController;

        id: 'userId',

        email: 'test@example.com',

        password: 'hashedPassword',

        role: 'Traveler',      await authController.register(req, res);      expect(normalizePhone('84123456789')).toBe('0123456789');describe('Auth Controller', () => {describe('Auth Controller', () => {

        name: 'Test User',

        username: '',

        phone: '',

        location: {}      expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });    });

      };

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

      User.findOne.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);      expect(User.create).toHaveBeenCalledWith({  let req, res;  let req, res;

      signAccess.mockReturnValue('accessToken');

      signRefresh.mockReturnValue('refreshToken');        email: 'test@example.com',

      newId.mockReturnValue('jti');

        password: 'hashedPassword',    it('should return original phone if already starts with 0', () => {

      await authController.login(req, res);

        name: 'Test User',

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');        username: undefined,      const { normalizePhone } = authController;

      expect(signAccess).toHaveBeenCalledWith({ id: 'userId', role: 'Traveler' });

      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'userId' });        phone: '0123456789',

      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      expect(res.status).toHaveBeenCalledWith(200);        role: 'Traveler',      expect(normalizePhone('0123456789')).toBe('0123456789');

      expect(res.json).toHaveBeenCalledWith({

        accessToken: 'accessToken',        location: {

        user: {

          _id: 'userId',          provinceId: '01',    });  beforeEach(() => {  beforeEach(() => {

          email: 'test@example.com',

          role: 'Traveler',          wardId: '001',

          name: 'Test User',

          username: '',          addressLine: '',

          phone: '',

          location: {},        },

        },

      });      });    it('should return empty string for null/undefined', () => {    req = {    req = {

    });

      expect(signAccess).toHaveBeenCalledWith({ id: 'newUserId', role: 'Traveler' });

    it('should return error for invalid credentials', async () => {

      req.body = {      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'newUserId' });      const { normalizePhone } = authController;

        email: 'test@example.com',

        password: 'wrongpassword'      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      };

      expect(res.status).toHaveBeenCalledWith(201);      expect(normalizePhone(null)).toBe('');      body: {},      body: {},

      User.findOne.mockResolvedValue(null);

      expect(res.json).toHaveBeenCalledWith({

      await authController.login(req, res);

        accessToken: 'accessToken',      expect(normalizePhone(undefined)).toBe('');

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        user: {

        error: 'INVALID_CREDENTIALS',

        message: 'Email hoặc mật khẩu không đúng.',          _id: 'newUserId',      expect(normalizePhone('')).toBe('');      user: { sub: 'userId', _id: 'userId' },      user: { sub: 'userId', _id: 'userId' },

      });

    });          email: 'test@example.com',

  });

          role: 'Traveler',    });

  describe('changePassword', () => {

    it('should change password successfully', async () => {          name: 'Test User',

      req.body = {

        oldPassword: 'oldpass',          username: '',  });      ip: '127.0.0.1',      ip: '127.0.0.1',

        newPassword: 'newpass123'

      };          phone: '0123456789',

      req.user = { sub: 'userId' };

          location: { provinceId: '01', wardId: '001', addressLine: '' },

      const mockUser = {

        id: 'userId',        },

        password: 'oldHashedPassword',

        save: jest.fn()      });  describe('register', () => {      get: jest.fn(() => 'test-user-agent'),      get: jest.fn(() => 'test-user-agent'),

      };

    });

      User.findById.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);    it('should register user successfully', async () => {

      bcrypt.hash.mockResolvedValue('newHashedPassword');

    it('should return validation error for invalid email', async () => {

      await authController.changePassword(req, res);

      req.body = {      req.body = {    };    };

      expect(User.findById).toHaveBeenCalledWith('userId');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'oldHashedPassword');        email: 'invalid-email',

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

      expect(mockUser.save).toHaveBeenCalled();        password: 'password123',        email: 'test@example.com',

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({        provinceId: '01',

        success: true,

        message: 'Mật khẩu đã được thay đổi thành công.',        wardId: '001'        password: 'password123',    res = {    res = {

      });

    });      };



    it('should return error for wrong old password', async () => {        name: 'Test User',

      req.body = {

        oldPassword: 'wrongoldpass',      await authController.register(req, res);

        newPassword: 'newpass123'

      };        phone: '84123456789',      status: jest.fn().mockReturnThis(),      status: jest.fn().mockReturnThis(),

      req.user = { sub: 'userId' };

      expect(res.status).toHaveBeenCalledWith(400);

      const mockUser = {

        id: 'userId',      expect(res.json).toHaveBeenCalledWith({        provinceId: '01',

        password: 'oldHashedPassword'

      };        error: 'VALIDATION_ERROR',



      User.findById.mockResolvedValue(mockUser);        message: expect.any(String),        wardId: '001'      json: jest.fn(),      json: jest.fn(),

      bcrypt.compare.mockResolvedValue(false);

      });

      await authController.changePassword(req, res);

    });      };

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({

        error: 'INVALID_OLD_PASSWORD',

        message: 'Mật khẩu cũ không đúng.',    it('should return error for taken email', async () => {      cookie: jest.fn(),      cookie: jest.fn(),

      });

    });      req.body = {

  });

        email: 'taken@example.com',      User.exists.mockResolvedValue(false);

  describe('forgotPassword', () => {

    it('should send reset email for existing user', async () => {        password: 'password123',

      req.body = { email: 'test@example.com' };

        provinceId: '01',      User.create.mockResolvedValue({    };    };

      const mockUser = {

        id: 'userId',        wardId: '001'

        email: 'test@example.com',

        save: jest.fn()      };        id: 'newUserId',

      };



      User.findOne.mockResolvedValue(mockUser);

      sendMail.mockResolvedValue();      User.exists.mockResolvedValue(true);        email: 'test@example.com',    jest.clearAllMocks();    jest.clearAllMocks();



      await authController.forgotPassword(req, res);



      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });      await authController.register(req, res);        role: 'Traveler',

      expect(sendMail).toHaveBeenCalled();

      expect(mockUser.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      expect(res.status).toHaveBeenCalledWith(409);        name: 'Test User',  });  });

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',      expect(res.json).toHaveBeenCalledWith({

      });

    });        error: 'EMAIL_TAKEN',        username: undefined,



    it('should not reveal non-existent email', async () => {        field: 'email',

      req.body = { email: 'nonexistent@example.com' };

        message: 'Email đã được sử dụng.',        phone: '0123456789',

      User.findOne.mockResolvedValue(null);

      });

      await authController.forgotPassword(req, res);

    });        location: { provinceId: '01', wardId: '001', addressLine: '' }

      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });

      expect(sendMail).not.toHaveBeenCalled();  });

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      });  describe('normalizePhone', () => {  describe('normalizePhone', () => {

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',  describe('login', () => {

      });

    });    it('should login user successfully', async () => {      bcrypt.hash.mockResolvedValue('hashedPassword');

  });

      req.body = {

  describe('resetPassword', () => {

    it('should reset password successfully', async () => {        email: 'test@example.com',      signAccess.mockReturnValue('accessToken');    it('should normalize Vietnamese phone number starting with 84', () => {    it('should normalize Vietnamese phone number starting with 84', () => {

      req.body = {

        token: 'validToken',        password: 'password123'

        newPassword: 'newpass123'

      };      };      signRefresh.mockReturnValue('refreshToken');



      const mockUser = {

        id: 'userId',

        resetPasswordToken: 'hashedToken',      const mockUser = {      newId.mockReturnValue('jti');      const { normalizePhone } = authController;      const { normalizePhone } = authController;

        resetPasswordExpires: new Date(Date.now() + 3600000),

        save: jest.fn()        id: 'userId',

      };

        email: 'test@example.com',

      User.findOne.mockResolvedValue(mockUser);

      bcrypt.hash.mockResolvedValue('newHashedPassword');        password: 'hashedPassword',

      sendMail.mockResolvedValue();

        role: 'Traveler',      await authController.register(req, res);      expect(normalizePhone('84123456789')).toBe('0123456789');      expect(normalizePhone('84123456789')).toBe('0123456789');

      await authController.resetPassword(req, res);

        name: 'Test User',

      expect(User.findOne).toHaveBeenCalledWith({

        resetPasswordToken: 'hashedToken',        username: '',

        resetPasswordExpires: { $gt: expect.any(Date) },

      });        phone: '',

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

      expect(mockUser.save).toHaveBeenCalled();        location: {}      expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });    });    });

      expect(sendMail).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);      };

      expect(res.json).toHaveBeenCalledWith({

        success: true,      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

        message: 'Mật khẩu đã được đặt lại thành công.',

      });      User.findOne.mockResolvedValue(mockUser);

    });

      bcrypt.compare.mockResolvedValue(true);      expect(User.create).toHaveBeenCalledWith({

    it('should return error for invalid token', async () => {

      req.body = {      signAccess.mockReturnValue('accessToken');

        token: 'invalidToken',

        newPassword: 'newpass123'      signRefresh.mockReturnValue('refreshToken');        email: 'test@example.com',

      };

      newId.mockReturnValue('jti');

      User.findOne.mockResolvedValue(null);

        password: 'hashedPassword',    it('should return original phone if already starts with 0', () => {    it('should return original phone if already starts with 0', () => {

      await authController.resetPassword(req, res);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        name: 'Test User',

        error: 'INVALID_TOKEN',

        message: 'Token không hợp lệ hoặc đã hết hạn.',      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });

      });

    });      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');        username: undefined,      const { normalizePhone } = authController;      const { normalizePhone } = authController;

  });

});      expect(signAccess).toHaveBeenCalledWith({ id: 'userId', role: 'Traveler' });

      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'userId' });        phone: '0123456789',

      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      expect(res.status).toHaveBeenCalledWith(200);        role: 'Traveler',      expect(normalizePhone('0123456789')).toBe('0123456789');      expect(normalizePhone('0123456789')).toBe('0123456789');

      expect(res.json).toHaveBeenCalledWith({

        accessToken: 'accessToken',        location: {

        user: {

          _id: 'userId',          provinceId: '01',    });    });

          email: 'test@example.com',

          role: 'Traveler',          wardId: '001',

          name: 'Test User',

          username: '',          addressLine: '',

          phone: '',

          location: {},        },

        },

      });      });    it('should return empty string for null/undefined', () => {    it('should return empty string for null/undefined', () => {

    });

      expect(signAccess).toHaveBeenCalledWith({ id: 'newUserId', role: 'Traveler' });

    it('should return error for invalid credentials', async () => {

      req.body = {      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'newUserId' });      const { normalizePhone } = authController;      const { normalizePhone } = authController;

        email: 'test@example.com',

        password: 'wrongpassword'      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      };

      expect(res.status).toHaveBeenCalledWith(201);      expect(normalizePhone(null)).toBe('');      expect(normalizePhone(null)).toBe('');

      User.findOne.mockResolvedValue(null);

      expect(res.json).toHaveBeenCalledWith({

      await authController.login(req, res);

        accessToken: 'accessToken',      expect(normalizePhone(undefined)).toBe('');      expect(normalizePhone(undefined)).toBe('');

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        user: {

        error: 'INVALID_CREDENTIALS',

        message: 'Email hoặc mật khẩu không đúng.',          _id: 'newUserId',      expect(normalizePhone('')).toBe('');      expect(normalizePhone('')).toBe('');

      });

    });          email: 'test@example.com',

  });

          role: 'Traveler',    });    });

  describe('changePassword', () => {

    it('should change password successfully', async () => {          name: 'Test User',

      req.body = {

        oldPassword: 'oldpass',          username: '',  });  });

        newPassword: 'newpass123'

      };          phone: '0123456789',

      req.user = { sub: 'userId' };

          location: { provinceId: '01', wardId: '001', addressLine: '' },

      const mockUser = {

        id: 'userId',        },

        password: 'oldHashedPassword',

        save: jest.fn()      });  describe('register', () => {  describe('register', () => { 

      };

    });

      User.findById.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);    it('should register user successfully', async () => {        id: 'newUserId2', 

      bcrypt.hash.mockResolvedValue('newHashedPassword');

    it('should return validation error for invalid email', async () => {

      await authController.changePassword(req, res);

      req.body = {      req.body = {        email: 'test2@example.com',

      expect(User.findById).toHaveBeenCalledWith('userId');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'oldHashedPassword');        email: 'invalid-email',

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

      expect(mockUser.save).toHaveBeenCalled();        password: 'password123',        email: 'test@example.com',        role: 'Traveler',

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({        provinceId: '01',

        success: true,

        message: 'Mật khẩu đã được thay đổi thành công.',        wardId: '001'        password: 'password123',        name: 'Test User',

      });

    });      };



    it('should return error for wrong old password', async () => {        name: 'Test User',        username: undefined,

      req.body = {

        oldPassword: 'wrongoldpass',      await authController.register(req, res);

        newPassword: 'newpass123'

      };        phone: '84123456789',        phone: '0912345678',

      req.user = { sub: 'userId' };

      expect(res.status).toHaveBeenCalledWith(400);

      const mockUser = {

        id: 'userId',      expect(res.json).toHaveBeenCalledWith({        provinceId: '01',        location: { provinceId: '01', wardId: '001', addressLine: '' }

        password: 'oldHashedPassword'

      };        error: 'VALIDATION_ERROR',



      User.findById.mockResolvedValue(mockUser);        message: expect.any(String),        wardId: '001'      });

      bcrypt.compare.mockResolvedValue(false);

      });

      await authController.changePassword(req, res);

    });      };      bcrypt.hash.mockResolvedValue('hashedPassword');

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({

        error: 'INVALID_OLD_PASSWORD',

        message: 'Mật khẩu cũ không đúng.',    it('should return error for taken email', async () => {      signAccess.mockReturnValue('accessToken');

      });

    });      req.body = {

  });

        email: 'taken@example.com',      User.exists.mockResolvedValue(false);      signRefresh.mockReturnValue('refreshToken');

  describe('forgotPassword', () => {

    it('should send reset email for existing user', async () => {        password: 'password123',

      req.body = { email: 'test@example.com' };

        provinceId: '01',      User.create.mockResolvedValue({      newId.mockReturnValue('jti');

      const mockUser = {

        id: 'userId',        wardId: '001'

        email: 'test@example.com',

        save: jest.fn()      };        id: 'newUserId',

      };



      User.findOne.mockResolvedValue(mockUser);

      sendMail.mockResolvedValue();      User.exists.mockResolvedValue(true);        email: 'test@example.com',      await authController.register(req, res);



      await authController.forgotPassword(req, res);



      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });      await authController.register(req, res);        role: 'Traveler',

      expect(sendMail).toHaveBeenCalled();

      expect(mockUser.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      expect(res.status).toHaveBeenCalledWith(409);        name: 'Test User',      expect(User.create).toHaveBeenCalledWith({

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',      expect(res.json).toHaveBeenCalledWith({

      });

    });        error: 'EMAIL_TAKEN',        username: undefined,        email: 'test2@example.com',



    it('should not reveal non-existent email', async () => {        field: 'email',

      req.body = { email: 'nonexistent@example.com' };

        message: 'Email đã được sử dụng.',        phone: '0123456789',        password: 'hashedPassword',

      User.findOne.mockResolvedValue(null);

      });

      await authController.forgotPassword(req, res);

    });        location: { provinceId: '01', wardId: '001', addressLine: '' }        name: 'Test User',

      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });

      expect(sendMail).not.toHaveBeenCalled();  });

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      });        username: undefined,

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',  describe('login', () => {

      });

    });    it('should login user successfully', async () => {      bcrypt.hash.mockResolvedValue('hashedPassword');        phone: '0912345678', // unchanged

  });

      req.body = {

  describe('resetPassword', () => {

    it('should reset password successfully', async () => {        email: 'test@example.com',      signAccess.mockReturnValue('accessToken');        role: 'Traveler',

      req.body = {

        token: 'validToken',        password: 'password123'

        newPassword: 'newpass123'

      };      };      signRefresh.mockReturnValue('refreshToken');        location: {



      const mockUser = {

        id: 'userId',

        resetPasswordToken: 'hashedToken',      const mockUser = {      newId.mockReturnValue('jti');          provinceId: '01',

        resetPasswordExpires: new Date(Date.now() + 3600000),

        save: jest.fn()        id: 'userId',

      };

        email: 'test@example.com',          wardId: '001',

      User.findOne.mockResolvedValue(mockUser);

      bcrypt.hash.mockResolvedValue('newHashedPassword');        password: 'hashedPassword',

      sendMail.mockResolvedValue();

        role: 'Traveler',      await authController.register(req, res);          addressLine: '',

      await authController.resetPassword(req, res);

        name: 'Test User',

      expect(User.findOne).toHaveBeenCalledWith({

        resetPasswordToken: 'hashedToken',        username: '',        },

        resetPasswordExpires: { $gt: expect.any(Date) },

      });        phone: '',

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

      expect(mockUser.save).toHaveBeenCalled();        location: {}      expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });      });

      expect(sendMail).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);      };

      expect(res.json).toHaveBeenCalledWith({

        success: true,      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);    });

        message: 'Mật khẩu đã được đặt lại thành công.',

      });      User.findOne.mockResolvedValue(mockUser);

    });

      bcrypt.compare.mockResolvedValue(true);      expect(User.create).toHaveBeenCalledWith({  });

    it('should return error for invalid token', async () => {

      req.body = {      signAccess.mockReturnValue('accessToken');

        token: 'invalidToken',

        newPassword: 'newpass123'      signRefresh.mockReturnValue('refreshToken');        email: 'test@example.com',

      };

      newId.mockReturnValue('jti');

      User.findOne.mockResolvedValue(null);

        password: 'hashedPassword',  describe('register', () => {

      await authController.resetPassword(req, res);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        name: 'Test User',    it('should register a new user successfully', async () => {

        error: 'INVALID_TOKEN',

        message: 'Token không hợp lệ hoặc đã hết hạn.',      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });

      });

    });      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');        username: undefined,      req.body = {

  });

});      expect(signAccess).toHaveBeenCalledWith({ id: 'userId', role: 'Traveler' });

      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'userId' });        phone: '0123456789',        email: 'test@example.com',

      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      expect(res.status).toHaveBeenCalledWith(200);        role: 'Traveler',        password: 'password123',

      expect(res.json).toHaveBeenCalledWith({

        accessToken: 'accessToken',        location: {        name: 'Test User',

        user: {

          _id: 'userId',          provinceId: '01',        username: 'testuser',

          email: 'test@example.com',

          role: 'Traveler',          wardId: '001',        phone: '0912345678',

          name: 'Test User',

          username: '',          addressLine: '',        role: 'Traveler',

          phone: '',

          location: {},        },        provinceId: '01',

        },

      });      });        wardId: '001',

    });

      expect(signAccess).toHaveBeenCalledWith({ id: 'newUserId', role: 'Traveler' });      };

    it('should return error for invalid credentials', async () => {

      req.body = {      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'newUserId' });

        email: 'test@example.com',

        password: 'wrongpassword'      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));      User.exists.mockResolvedValue(false);

      };

      expect(res.status).toHaveBeenCalledWith(201);      User.create.mockResolvedValue({ 

      User.findOne.mockResolvedValue(null);

      expect(res.json).toHaveBeenCalledWith({        id: 'newUserId', 

      await authController.login(req, res);

        accessToken: 'accessToken',        email: 'test@example.com',

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        user: {        role: 'Traveler',

        error: 'INVALID_CREDENTIALS',

        message: 'Email hoặc mật khẩu không đúng.',          _id: 'newUserId',        name: 'Test User',

      });

    });          email: 'test@example.com',        username: 'testuser',

  });

          role: 'Traveler',        phone: '0912345678',

  describe('changePassword', () => {

    it('should change password successfully', async () => {          name: 'Test User',        location: { provinceId: '01', wardId: '001', addressLine: '' }

      req.body = {

        oldPassword: 'oldpass',          username: '',      });

        newPassword: 'newpass123'

      };          phone: '0123456789',      bcrypt.hash.mockResolvedValue('hashedPassword');

      req.user = { sub: 'userId' };

          location: { provinceId: '01', wardId: '001', addressLine: '' },      signAccess.mockReturnValue('accessToken');

      const mockUser = {

        id: 'userId',        },      signRefresh.mockReturnValue('refreshToken');

        password: 'oldHashedPassword',

        save: jest.fn()      });      newId.mockReturnValue('jti');

      };

    });

      User.findById.mockResolvedValue(mockUser);

      bcrypt.compare.mockResolvedValue(true);      await authController.register(req, res);

      bcrypt.hash.mockResolvedValue('newHashedPassword');

    it('should return validation error for invalid email', async () => {

      await authController.changePassword(req, res);

      req.body = {      expect(User.exists).toHaveBeenCalledWith({ email: 'test@example.com' });

      expect(User.findById).toHaveBeenCalledWith('userId');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'oldHashedPassword');        email: 'invalid-email',      expect(User.exists).toHaveBeenCalledWith({ username: 'testuser' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

      expect(mockUser.save).toHaveBeenCalled();        password: 'password123',      expect(User.exists).toHaveBeenCalledWith({ phone: '0912345678' });

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({        provinceId: '01',      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

        success: true,

        message: 'Mật khẩu đã được thay đổi thành công.',        wardId: '001'      expect(User.create).toHaveBeenCalledWith({

      });

    });      };        email: 'test@example.com',



    it('should return error for wrong old password', async () => {        password: 'hashedPassword',

      req.body = {

        oldPassword: 'wrongoldpass',      await authController.register(req, res);        name: 'Test User',

        newPassword: 'newpass123'

      };        username: 'testuser',

      req.user = { sub: 'userId' };

      expect(res.status).toHaveBeenCalledWith(400);        phone: '0912345678',

      const mockUser = {

        id: 'userId',      expect(res.json).toHaveBeenCalledWith({        role: 'Traveler',

        password: 'oldHashedPassword'

      };        error: 'VALIDATION_ERROR',        location: {



      User.findById.mockResolvedValue(mockUser);        message: expect.any(String),          provinceId: '01',

      bcrypt.compare.mockResolvedValue(false);

      });          wardId: '001',

      await authController.changePassword(req, res);

    });          addressLine: '',

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        },

        error: 'INVALID_OLD_PASSWORD',

        message: 'Mật khẩu cũ không đúng.',    it('should return error for taken email', async () => {      });

      });

    });      req.body = {      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'newUserId' });

  });

        email: 'taken@example.com',      expect(signAccess).toHaveBeenCalledWith({ id: 'newUserId', role: 'Traveler' });

  describe('forgotPassword', () => {

    it('should send reset email for existing user', async () => {        password: 'password123',      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      req.body = { email: 'test@example.com' };

        provinceId: '01',      expect(res.status).toHaveBeenCalledWith(201);

      const mockUser = {

        id: 'userId',        wardId: '001'      expect(res.json).toHaveBeenCalledWith({

        email: 'test@example.com',

        save: jest.fn()      };        accessToken: 'accessToken',

      };

        user: {

      User.findOne.mockResolvedValue(mockUser);

      sendMail.mockResolvedValue();      User.exists.mockResolvedValue(true);          _id: 'newUserId',



      await authController.forgotPassword(req, res);          email: 'test@example.com',



      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });      await authController.register(req, res);          role: 'Traveler',

      expect(sendMail).toHaveBeenCalled();

      expect(mockUser.save).toHaveBeenCalled();          name: 'Test User',

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      expect(res.status).toHaveBeenCalledWith(409);          username: 'testuser',

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',      expect(res.json).toHaveBeenCalledWith({          phone: '0912345678',

      });

    });        error: 'EMAIL_TAKEN',          location: {



    it('should not reveal non-existent email', async () => {        field: 'email',            provinceId: '01',

      req.body = { email: 'nonexistent@example.com' };

        message: 'Email đã được sử dụng.',            wardId: '001',

      User.findOne.mockResolvedValue(null);

      });            addressLine: '',

      await authController.forgotPassword(req, res);

    });          },

      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });

      expect(sendMail).not.toHaveBeenCalled();  });        },

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      });

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',  describe('login', () => {    });

      });

    });    it('should login user successfully', async () => {

  });

      req.body = {    it('should return error if email already exists', async () => {

  describe('resetPassword', () => {

    it('should reset password successfully', async () => {        email: 'test@example.com',      req.body = {

      req.body = {

        token: 'validToken',        password: 'password123'        email: 'existing@example.com',

        newPassword: 'newpass123'

      };      };        password: 'password123',



      const mockUser = {        name: 'Test User',

        id: 'userId',

        resetPasswordToken: 'hashedToken',      const mockUser = {        provinceId: '01',

        resetPasswordExpires: new Date(Date.now() + 3600000),

        save: jest.fn()        id: 'userId',        wardId: '001'

      };

        email: 'test@example.com',      };

      User.findOne.mockResolvedValue(mockUser);

      bcrypt.hash.mockResolvedValue('newHashedPassword');        password: 'hashedPassword',      User.exists.mockResolvedValueOnce(true); // email exists

      sendMail.mockResolvedValue();

        role: 'Traveler',

      await authController.resetPassword(req, res);

        name: 'Test User',      await authController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({

        resetPasswordToken: 'hashedToken',        username: '',

        resetPasswordExpires: { $gt: expect.any(Date) },

      });        phone: '',      expect(User.exists).toHaveBeenCalledWith({ email: 'existing@example.com' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

      expect(mockUser.save).toHaveBeenCalled();        location: {}      expect(res.status).toHaveBeenCalledWith(409);

      expect(sendMail).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);      };      expect(res.json).toHaveBeenCalledWith({

      expect(res.json).toHaveBeenCalledWith({

        success: true,        error: 'EMAIL_TAKEN',

        message: 'Mật khẩu đã được đặt lại thành công.',

      });      User.findOne.mockResolvedValue(mockUser);        field: 'email',

    });

      bcrypt.compare.mockResolvedValue(true);        message: 'Email đã được sử dụng.',

    it('should return error for invalid token', async () => {

      req.body = {      signAccess.mockReturnValue('accessToken');      });

        token: 'invalidToken',

        newPassword: 'newpass123'      signRefresh.mockReturnValue('refreshToken');    });

      };

      newId.mockReturnValue('jti');

      User.findOne.mockResolvedValue(null);

    it('should return validation error for invalid email', async () => {

      await authController.resetPassword(req, res);

      await authController.login(req, res);      req.body = {

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({        email: 'invalid-email',

        error: 'INVALID_TOKEN',

        message: 'Token không hợp lệ hoặc đã hết hạn.',      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });        password: 'password123',

      });

    });      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');        name: 'Test User',

  });

});      expect(signAccess).toHaveBeenCalledWith({ id: 'userId', role: 'Traveler' });        provinceId: '01',

      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'userId' });        wardId: '001'

      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));      };

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({      await authController.register(req, res);

        accessToken: 'accessToken',

        user: {      expect(res.status).toHaveBeenCalledWith(400);

          _id: 'userId',      expect(res.json).toHaveBeenCalledWith({

          email: 'test@example.com',        error: 'VALIDATION_ERROR',

          role: 'Traveler',        message: expect.any(String),

          name: 'Test User',      });

          username: '',    });

          phone: '',  });

          location: {},

        },  describe('login', () => {

      });    it('should login user successfully', async () => {

    });      req.body = { username: 'testuser', password: 'password123' };



    it('should return error for invalid credentials', async () => {      const mockUser = {

      req.body = {        id: 'userId',

        email: 'test@example.com',        email: 'test@example.com',

        password: 'wrongpassword'        password: 'hashedPassword',

      };        role: 'Traveler',

        name: 'Test User',

      User.findOne.mockResolvedValue(null);        username: 'testuser',

        phone: '0912345678',

      await authController.login(req, res);        location: { provinceId: '01', wardId: '001' },

      };

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({      User.findOne.mockResolvedValue(mockUser);

        error: 'INVALID_CREDENTIALS',      bcrypt.compare.mockResolvedValue(true);

        message: 'Email hoặc mật khẩu không đúng.',      signAccess.mockReturnValue('accessToken');

      });      signRefresh.mockReturnValue('refreshToken');

    });      newId.mockReturnValue('jti');

  });

      await authController.login(req, res);

  describe('changePassword', () => {

    it('should change password successfully', async () => {      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });

      req.body = {      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');

        oldPassword: 'oldpass',      expect(signRefresh).toHaveBeenCalledWith({ jti: 'jti', userId: 'userId' });

        newPassword: 'newpass123'      expect(signAccess).toHaveBeenCalledWith({ id: 'userId', role: 'Traveler' });

      };      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', expect.any(Object));

      req.user = { sub: 'userId' };      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({

      const mockUser = {        accessToken: 'accessToken',

        id: 'userId',        user: {

        password: 'oldHashedPassword',          _id: 'userId',

        save: jest.fn()          email: 'test@example.com',

      };          role: 'Traveler',

          name: 'Test User',

      User.findById.mockResolvedValue(mockUser);          username: 'testuser',

      bcrypt.compare.mockResolvedValue(true);          phone: '0912345678',

      bcrypt.hash.mockResolvedValue('newHashedPassword');          location: { provinceId: '01', wardId: '001' },

        },

      await authController.changePassword(req, res);      });

    });

      expect(User.findById).toHaveBeenCalledWith('userId');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'oldHashedPassword');    it('should return error for invalid credentials', async () => {

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);      req.body = { username: 'testuser', password: 'wrongpassword' };

      expect(mockUser.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);      User.findOne.mockResolvedValue(null);

      expect(res.json).toHaveBeenCalledWith({

        success: true,      await authController.login(req, res);

        message: 'Mật khẩu đã được thay đổi thành công.',

      });      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });

    });      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({

    it('should return error for wrong old password', async () => {        message: 'Invalid email or password',

      req.body = {      });

        oldPassword: 'wrongoldpass',    });

        newPassword: 'newpass123'  });

      };

      req.user = { sub: 'userId' };  describe('changePassword', () => {

    it('should change password successfully', async () => {

      const mockUser = {      req.user = { _id: 'userId' };

        id: 'userId',      req.body = { oldPassword: 'oldpass', newPassword: 'newpass123' };

        password: 'oldHashedPassword'

      };      const mockUser = {

        id: 'userId',

      User.findById.mockResolvedValue(mockUser);        password: 'oldHashedPassword',

      bcrypt.compare.mockResolvedValue(false);        save: jest.fn(),

      };

      await authController.changePassword(req, res);

      User.findById.mockResolvedValue(mockUser);

      expect(res.status).toHaveBeenCalledWith(400);      bcrypt.compare.mockResolvedValue(true);

      expect(res.json).toHaveBeenCalledWith({      bcrypt.hash.mockResolvedValue('newHashedPassword');

        error: 'INVALID_OLD_PASSWORD',

        message: 'Mật khẩu cũ không đúng.',      await authController.changePassword(req, res);

      });

    });      expect(User.findById).toHaveBeenCalledWith('userId');

  });      expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'oldHashedPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);

  describe('forgotPassword', () => {      expect(mockUser.save).toHaveBeenCalled();

    it('should send reset email for existing user', async () => {      expect(res.status).toHaveBeenCalledWith(200);

      req.body = { email: 'test@example.com' };      expect(res.json).toHaveBeenCalledWith({

        message: 'Mật khẩu đã được thay đổi thành công',

      const mockUser = {      });

        id: 'userId',    });

        email: 'test@example.com',  });

        save: jest.fn()

      };  describe('forgotPassword', () => {

    it('should send reset email for existing user', async () => {

      User.findOne.mockResolvedValue(mockUser);      req.body = { email: 'test@example.com' };

      sendMail.mockResolvedValue();

      const mockUser = {

      await authController.forgotPassword(req, res);        id: 'userId',

        email: 'test@example.com',

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });        save: jest.fn(),

      expect(sendMail).toHaveBeenCalled();      };

      expect(mockUser.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);      User.findOne.mockResolvedValue(mockUser);

      expect(res.json).toHaveBeenCalledWith({      sendMail.mockResolvedValue({});

        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',      await authController.forgotPassword(req, res);

      });

    });      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });

      expect(sendMail).toHaveBeenCalled();

    it('should not reveal non-existent email', async () => {      expect(mockUser.save).toHaveBeenCalled();

      req.body = { email: 'nonexistent@example.com' };      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({

      User.findOne.mockResolvedValue(null);        success: true,

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',

      await authController.forgotPassword(req, res);      });

    });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });

      expect(sendMail).not.toHaveBeenCalled();    it('should not reveal non-existent email', async () => {

      expect(res.status).toHaveBeenCalledWith(200);      req.body = { email: 'nonexistent@example.com' };

      expect(res.json).toHaveBeenCalledWith({

        success: true,      User.findOne.mockResolvedValue(null);

        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',

      });      await authController.forgotPassword(req, res);

    });

  });      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });

      expect(res.status).toHaveBeenCalledWith(200);

  describe('resetPassword', () => {      expect(res.json).toHaveBeenCalledWith({

    it('should reset password successfully', async () => {        success: true,

      req.body = {        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',

        token: 'validToken',      });

        newPassword: 'newpass123'    });

      };  });



      const mockUser = {  describe('resetPassword', () => {

        id: 'userId',    it('should reset password successfully', async () => {

        resetPasswordToken: 'hashedToken',      req.body = { token: 'validtoken', password: 'newpassword123' };

        resetPasswordExpires: new Date(Date.now() + 3600000),

        save: jest.fn()      const mockUser = {

      };        id: 'userId',

        email: 'test@example.com',

      User.findOne.mockResolvedValue(mockUser);        resetPasswordToken: 'hashedToken',

      bcrypt.hash.mockResolvedValue('newHashedPassword');        resetPasswordExpires: new Date(Date.now() + 3600000),

      sendMail.mockResolvedValue();        save: jest.fn(),

      };

      await authController.resetPassword(req, res);

      User.findOne.mockResolvedValue(mockUser);

      expect(User.findOne).toHaveBeenCalledWith({      bcrypt.compare.mockResolvedValue(true);

        resetPasswordToken: 'hashedToken',      bcrypt.hash.mockResolvedValue('newHashedPassword');

        resetPasswordExpires: { $gt: expect.any(Date) },      sendMail.mockResolvedValue({});

      });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);      await authController.resetPassword(req, res);

      expect(mockUser.save).toHaveBeenCalled();

      expect(sendMail).toHaveBeenCalled();      expect(User.findOne).toHaveBeenCalledWith({

      expect(res.status).toHaveBeenCalledWith(200);        resetPasswordToken: 'hashedToken',

      expect(res.json).toHaveBeenCalledWith({        resetPasswordExpires: { $gt: expect.any(Date) },

        success: true,      });

        message: 'Mật khẩu đã được đặt lại thành công.',      expect(bcrypt.compare).toHaveBeenCalledWith('validtoken', 'hashedToken');

      });      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);

    });      expect(mockUser.save).toHaveBeenCalled();

      expect(sendMail).toHaveBeenCalled();

    it('should return error for invalid token', async () => {      expect(res.status).toHaveBeenCalledWith(200);

      req.body = {      expect(res.json).toHaveBeenCalledWith({

        token: 'invalidToken',        message: 'Mật khẩu đã được đặt lại thành công',

        newPassword: 'newpass123'      });

      };    });



      User.findOne.mockResolvedValue(null);    it('should return error for invalid token', async () => {

      req.body = { token: 'invalidtoken', password: 'newpassword123' };

      await authController.resetPassword(req, res);

      User.findOne.mockResolvedValue(null);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({      await authController.resetPassword(req, res);

        error: 'INVALID_TOKEN',

        message: 'Token không hợp lệ hoặc đã hết hạn.',      expect(res.status).toHaveBeenCalledWith(400);

      });      expect(res.json).toHaveBeenCalledWith({

    });        message: 'Thiếu thông tin',

  });      });

});    });
  });
});