import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedSubscriber } from './events/ticket-created-subscriber';

console.clear();

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

client.on('connect', () => {
  console.log('Listener connected to NATs');

  client.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  new TicketCreatedSubscriber(client).listen();
});

process.on('SIGINT', () => client.close());
process.on('SIGTERM', () => client.close());
