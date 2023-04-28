import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@shatatickets/shared';
import { TicketUpdatedSubscriber } from '../ticket-updated-subscriber';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const subscriber = new TicketUpdatedSubscriber(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'USA Match',
    price: 300,
  });

  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Spain Match',
    price: 300,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg, ticket };
};

it('Should find, update, and save a ticket', async () => {
  const { data, subscriber, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('Should ack a message', async () => {
  const { data, subscriber, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('Should not call ack if the event has a skipped version number', async () => {
  const { subscriber, data, msg } = await setup();

  data.version = 15;

  try {
    await subscriber.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
