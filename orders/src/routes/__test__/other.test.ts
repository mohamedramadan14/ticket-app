import request from 'supertest';
import { app } from '../../app';

it('should return 404 for paths that does not exist', async () => {
  await request(app).post('/api/bala').send({}).expect(404);
  await request(app).get('/api/bala').send({}).expect(404);
  await request(app).put('/api/bala').send({}).expect(404);
  await request(app).delete('/api/bala').send({}).expect(404);
});
