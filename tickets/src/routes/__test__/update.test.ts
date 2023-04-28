import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const id = new mongoose.Types.ObjectId().toHexString();
it('returns a 404 if provided ID does not exist', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'USA Match',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if user is not authenticated', async () => {
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'USA Match',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if user is not own the ticket', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'USA Match',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', signin())
    .send({
      title: 'Spain Match',
      price: 15,
    })
    .expect(401);
});

it('returns a 400 if user provides invalid title or price', async () => {
  const session = signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', session)
    .send({
      title: 'USA Match',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send({
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send({
      title: 'USA Match',
      price: -20,
    })
    .expect(400);
});

it('returns a 200 if tickets updated successfully', async () => {
  const session = signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', session)
    .send({
      title: 'USA Match',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send({
      title: 'new Match',
      price: 100,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send();

  expect(ticketResponse.body.title).toEqual('new Match');
  expect(ticketResponse.body.price).toEqual(100);
});

it('publish an event', async () => {
  const session = signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', session)
    .send({
      title: 'USA Match',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send({
      title: 'new Match',
      price: 100,
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it('Should reject the update of ticket if it reserved', async () => {
  const session = signin();
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', session)
    .send({
      title: 'USA Match',
      price: 20,
    });

  const ticket = await Ticket.findById(res.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', session)
    .send({
      title: 'new Match',
      price: 100,
    })
    .expect(400);
});
