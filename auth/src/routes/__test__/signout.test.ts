import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signout', async () => {
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
      password: 'test',
    })
    .expect(200);

  const res = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);
  expect(res.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
