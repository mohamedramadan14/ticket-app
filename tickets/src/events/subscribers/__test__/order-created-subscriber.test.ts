import { OrderCreatedEvent, OrderStatus } from '@shatatickets/shared';
import { OrderCreatedSubscriber } from '../order-created-subscriber';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'USA Match',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expireAt: new Date().toString(),
    ticket: {
      id: ticket.id,
      price: Number(ticket.price),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg, ticket };
};

it('Should set the orderId of the ticket', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toBeDefined();
  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('Should ack the message', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('publish a ticket:updated event', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
