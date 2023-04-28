import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedSubscriber } from '../ticket-created-subscriber';
import { TicketCreatedEvent } from '@shatatickets/shared';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const subscriber = new TicketCreatedSubscriber(natsWrapper.client);

  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 30,
    title: 'USA Match',
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { subscriber, data, msg };
};

describe('Ticket Created Subscriber', () => {
  it('Should create a new ticket and save it', async () => {
    const { subscriber, data, msg } = await setup();
    await subscriber.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });

  it('Should ack the message', async () => {
    const { subscriber, data, msg } = await setup();
    await subscriber.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(msg.ack).toHaveBeenCalledTimes(1);
  });
});
