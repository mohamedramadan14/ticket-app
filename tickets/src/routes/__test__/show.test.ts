import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';


it('returns a 404 if a ticket with passed id not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  console.log(id);
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns a ticket if a ticket with passed id is found', async () => {
  const title = 'USA Match';
  const price = 20;

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send({})
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
