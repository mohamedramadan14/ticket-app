import { Publisher, Subjects, OrderCancelledEvent } from '@shatatickets/shared';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
