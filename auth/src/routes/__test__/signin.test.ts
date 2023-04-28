import request from 'supertest';
import { app } from '../../app';

it('returns 400 as no email or invalid email passed', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test',
      password: 'test',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signin')
    .send({
      password: 'test',
    })
    .expect(400);
});

it('returns 400 as no password  passed', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test',
    })
    .expect(400);
});

it('fails if the email supplied does not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('fails when incorrect password or email is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'koko',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@hi.com',
      password: 'test',
    })
    .expect(400);
});

it('returns a cookie in successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(201);

  const res = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'test',
    })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});
