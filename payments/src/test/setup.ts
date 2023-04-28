import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

// To BE removed when pushed to github
process.env.STRIPE_KEY =
  'sk_test_51MGL3dG2LzXl7jutZI5l3I8MTdxOVR5X2EJAhnvrlcIiFKzwLfdkQz0qSDeaAf83sU1ArP4un4syaOkXm7MIbyh500rhyU3z4h';

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@hi.com',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = JSON.stringify({ jwt: token });

  const base64Session = Buffer.from(session).toString('base64');

  return [`session=${base64Session}`];
};
