import { Publisher, Subjects, OrderCreatedEvent } from '@shatatickets/shared';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
