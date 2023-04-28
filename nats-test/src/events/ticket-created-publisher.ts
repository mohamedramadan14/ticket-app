import { TicketCreatedEvent } from './ticket-created-event';
import { Publisher } from './base-publisher';
import { Subjects } from './subject';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
