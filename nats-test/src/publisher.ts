import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import nats from 'node-nats-streaming';

console.clear();

const client = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

client.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(client);
  try {
    await publisher.publish({
      id: '123',
      title: 'Match',
      price: 20,
    });
  } catch (error) {
    console.error(error);
  }
});
