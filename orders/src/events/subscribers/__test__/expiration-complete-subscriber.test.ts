import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteSubscriber } from '../expiration-complete-subscriber';
import mongoose from 'mongoose';
import { ExpirationCompleteEvent } from '@shatatickets/shared';

const setup = async () => {
  const subscriber = new ExpirationCompleteSubscriber(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'USA Match',
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expireAt: new Date(),
    ticket,
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, ticket, order, data, msg };
};

it('Should update order status to cancelled', async () => {
  const { data, msg, subscriber, order } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Should emit an order:cancelled even', async () => {
  const { data, msg, subscriber, order } = await setup();

  await subscriber.onMessage(data, msg);

  expect(natsWrapper.client.publish as jest.Mock).toHaveBeenCalled();
  expect(natsWrapper.client.publish as jest.Mock).toHaveBeenCalledTimes(1);

  const { id } = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(id).toEqual(order.id);
});

it('Should ack the message', async () => {
  const { data, msg, subscriber } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
