import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

const ticketId = new mongoose.Types.ObjectId().toHexString();
const baseURL = '/api/orders';

it('return 401 if user is not authenticated', async () => {
  await request(app).post(baseURL).send({ ticketId }).expect(401);
});

it('returns 400 if body contains invalid ticketId', async () => {
  const res = await request(app)
    .post(baseURL)
    .set('Cookie', signin())
    .send({
      ticketId: 'invalid',
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual('TicketId must be provided');

  await request(app).post(baseURL).set('Cookie', signin()).send({}).expect(400);
});

it('return a 404 if ticket does not exist', async () => {
  await request(app)
    .post(baseURL)
    .set('Cookie', signin())
    .send({ ticketId })
    .expect(404);
});

it('return 400 error if ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'USA Match',
    price: 20,
  });
  await ticket.save();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 10 * 60);

  const order = Order.build({
    ticket,
    userId: 'user-id',
    status: OrderStatus.Created,
    expireAt: expiration,
  });
  await order.save();

  const res = await request(app)
    .post(baseURL)
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(400);
  expect(res.body.errors[0].message).toEqual('Ticket is already reserved');
});

it('return 201 to successfully reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Barca Match',
    price: 1000,
  });
  await ticket.save();

  const res = await request(app)
    .post(baseURL)
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(res.body.status).toEqual(OrderStatus.Created);
  expect(res.body.ticket.id).toEqual(ticket.id);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Barca Match',
    price: 1000,
  });
  await ticket.save();

  const res = await request(app)
    .post(baseURL)
    .set('Cookie', signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(res.body.status).toEqual(OrderStatus.Created);
  expect(res.body.ticket.id).toEqual(ticket.id);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
