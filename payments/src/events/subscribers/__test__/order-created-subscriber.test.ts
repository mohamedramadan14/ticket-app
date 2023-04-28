import { OrderCreatedEvent, OrderStatus } from '@shatatickets/shared';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedSubscriber } from '../order-created-subscriber';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expireAt: new Date().toString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 20,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg };
};

it('replicates order info from event data', async () => {
  const { data, msg, subscriber } = await setup();

  await subscriber.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order).toBeDefined();
  expect(order!.price).toEqual(data.ticket.price);
});

it('Should ack the message', async () => {
  const { data, msg, subscriber } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
