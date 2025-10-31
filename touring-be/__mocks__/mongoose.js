// __mocks__/mongoose.js
const ObjectId = function ObjectIdMock(id) { return id || 'mock-object-id'; };

const SchemaMock = jest.fn().mockImplementation((definition, options) => {
  const schemaObj = {
    pre: jest.fn(),
    methods: {},
    statics: {},
    index: jest.fn(),
    add: jest.fn(),
    _definition: definition,
    options: options || {},
    Types: { ObjectId },
  };
  schemaObj.Types = { ObjectId };
  schemaObj.constructor = { Types: { ObjectId } };
  return schemaObj;
});
SchemaMock.Types = { ObjectId };
SchemaMock.prototype = { Types: { ObjectId } };

module.exports = {
  Schema: SchemaMock,
  SchemaTypes: { ObjectId },
  Types: { ObjectId },
  model: jest.fn().mockImplementation((name, schema, collection) => {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      populate: jest.fn(),
      collection: collection || name.toLowerCase() + 's',
      schema: schema
    };
  }),
  models: {},
};
