import request from 'supertest';
import { app } from '../../app';

it('responds with details about current user', async () => {
  const cookie = await global.signin();

  const { body: user } = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send({})
    .expect(200);
  expect(user.currentUser).toBeDefined();
  expect(user.currentUser['id']).toBeDefined();
  expect(user.currentUser['email']).toBeDefined();
  expect(user.currentUser['email']).toEqual('test@test.com');
  expect(user.currentUser['iat']).toBeDefined();
});

it('responds with null if not authenticated', async () => {
  const res = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);
  expect(res.body.currentUser).toEqual(null);
});
