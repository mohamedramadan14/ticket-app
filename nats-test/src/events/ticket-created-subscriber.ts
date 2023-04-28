import { Subjects } from './subject';
import { Message } from 'node-nats-streaming';
import { Subscriber } from './base-subscriber';
import { TicketCreatedEvent } from './ticket-created-event';

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;

  queueGroupName = 'payment-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log(`Event Data: ${data}`);
    console.log(data.price);
    msg.ack();
  }
}
