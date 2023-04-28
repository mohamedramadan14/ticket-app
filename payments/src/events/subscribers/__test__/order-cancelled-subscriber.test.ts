import { Order } from '../../../models/order';
import { OrderCancelledEvent, OrderStatus } from '@shatatickets/shared';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledSubscriber } from '../order-cancelled-subscriber';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const subscriber = new OrderCancelledSubscriber(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, order, data, msg };
};

it('Should updates status of order to Cancelled', async () => {
  const { data, msg, order, subscriber } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(updatedOrder!.version).toEqual(order.version + 1);
});

it('Should ack the message', async () => {
  const { data, msg, order, subscriber } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('Should throw an error if order not found', async () => {
  const { data, msg, order, subscriber } = await setup();

  data.id = new mongoose.Types.ObjectId().toHexString();

  await expect(subscriber.onMessage(data, msg)).rejects.toThrow(
    'Order not found'
  );
});
