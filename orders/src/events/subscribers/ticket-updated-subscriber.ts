import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Subjects, Subscriber, TicketUpdatedEvent } from '@shatatickets/shared';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price, version } = data;

    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
