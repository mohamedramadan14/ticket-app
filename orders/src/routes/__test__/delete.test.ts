import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
// TODO missed cases in tests

it('return 204 for mark an order as cancelled', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'USA Match',
    price: 20,
  });

  await ticket.save();
  const user = signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //console.log(order);
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);
  const cancelledOrder = await Order.findById(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('returns a 404 when the order is not found', async () => {
  const user = signin();
  const orderId = new mongoose.Types.ObjectId().toHexString();

  const res = await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', user)
    .expect(404);
  expect(res.body.errors[0].message).toEqual('Not Found');
});

it('emit order:cancelled event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'USA Match',
    price: 20,
  });

  await ticket.save();
  const user = signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //console.log(order);
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);
  const cancelledOrder = await Order.findById(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
