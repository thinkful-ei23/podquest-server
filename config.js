'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_URL:
        process.env.MONGODB_URI || 'mongodb://localhost/podquest-backend',
  TEST_DATABASE_URL:
        process.env.MONGODB_URI ||
        'mongodb://localhost/podquest-backend-test',
  JWT_SECRET: process.env.JWT_SECRET || 'TO_UNDERSTAND_RECURION_YOU_MUST_FIRST_UNDERSTAND_RECURSION',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d'
  // DATABASE_URL:
  //     process.env.DATABASE_URL || 'postgres://localhost/thinkful-backend',
  // TEST_DATABASE_URL:
  //     process.env.TEST_DATABASE_URL ||
  //     'postgres://localhost/thinkful-backend-test'
};
