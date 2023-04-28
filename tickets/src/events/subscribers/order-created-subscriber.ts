import { OrderCreatedEvent, Subjects, Subscriber } from '@shatatickets/shared';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { id, ticket: ticketOrder } = data;

    const ticket = await Ticket.findById(ticketOrder.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set('orderId', id);

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      price: Number(ticket.price),
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
