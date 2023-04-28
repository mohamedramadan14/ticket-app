import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'USA Match',
    price: 10,
  });

  await ticket.save();

  return ticket;
};

const baseURL = '/api/orders';

it('return list of orders for current user', async () => {
  const userOne = signin();
  const userTwo = signin();

  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  await request(app)
    .post(baseURL)
    .set('Cookie', userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  // create Order#1 as userTwo
  const { body: orderOne } = await request(app)
    .post(baseURL)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  // create order#2 as userTwo

  const { body: orderTwo } = await request(app)
    .post(baseURL)
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const res = await request(app)
    .get(baseURL)
    .set('Cookie', userTwo)
    .send({})
    .expect(200);

  expect(res.body.length).toEqual(2);
  expect(res.body[0].id).toEqual(orderOne.id);
  expect(res.body[1].id).toEqual(orderTwo.id);
  expect(res.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(res.body[1].ticket.id).toEqual(ticketThree.id);
});
