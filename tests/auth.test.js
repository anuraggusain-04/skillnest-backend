const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Course.deleteMany({});
});

describe('Authentication API', () => {
  it('registers a new user and returns a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Tester',
        email: 'alice@example.com',
        password: 'Secret123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.token).toBeTruthy();
  });

  it('rejects duplicate registration with existing email', async () => {
    await User.create({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashedpw'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: 'existing@example.com',
        password: 'Secret123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('logs in with valid credentials and returns a JWT', async () => {
    const password = 'Secret123!';
    await User.create({
      name: 'Login User',
      email: 'login@example.com',
      password: '$2a$10$WQ6mndu7mVQKfVJdM2M7JeV3z4uLn7M5m4jGQIR3VbtW9l6A2p4MC2'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('rejects invalid login credentials', async () => {
    await User.create({
      name: 'Bad User',
      email: 'bad@example.com',
      password: 'hashedpw'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad@example.com', password: 'wrongpass' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});

describe('Course API', () => {
  it('requires admin access to create a course', async () => {
    const user = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      password: 'hashedpw',
      role: 'user'
    });

    const token = require('jsonwebtoken').sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Intro to API Security',
        description: 'Learn API security patterns',
        category: 'Security',
        price: 299,
        instructor: 'Jane Doe'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin access only/i);
  });

  it('prevents duplicate enrollment for the same course', async () => {
    const user = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'hashedpw',
      enrolledCourses: []
    });

    const course = await Course.create({
      title: 'MongoDB Basics',
      description: 'Learn MongoDB basics',
      category: 'Database',
      price: 199,
      instructor: 'John Smith'
    });

    user.enrolledCourses.push(course._id);
    await user.save();

    const token = require('jsonwebtoken').sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post(`/api/courses/${course._id}/enroll`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already enrolled/i);
  });
});
