import { Ticket } from '../ticket';
import mongoose from 'mongoose';

it('should build a ticket', async () => {
  const ticketAttrs = {
    title: 'Test ticket',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  const ticket = Ticket.build(ticketAttrs);

  expect(ticket.title).toEqual(ticketAttrs.title);
  expect(ticket.price).toEqual(Number(ticketAttrs.price));
  expect(ticket.userId).toEqual(ticketAttrs.userId);
});

it('should have a version number', async () => {
  const ticketAttrs = {
    title: 'Test ticket',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  const ticket = Ticket.build(ticketAttrs);
  await ticket.save();
  expect(ticket.version).toBeDefined();
});

it('should have a id not _id', async () => {
  const ticketAttrs = {
    title: 'Test ticket',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  const ticket = Ticket.build(ticketAttrs);
  const ticketJson = ticket.toJSON();
  expect(ticketJson._id).toBeUndefined();
  expect(ticketJson.id).toBeDefined();
});

it('should update version number on save', async () => {
  const ticketAttrs = {
    title: 'Test ticket',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  const ticket = Ticket.build(ticketAttrs);
  await ticket.save();
  const firstVersion = ticket.version;
  await ticket.save();
  expect(ticket.version).toEqual(firstVersion + 1);
});

it('implements OCC: (Optimistic Concurrency Control) for updates: version INC on save', async () => {
  const ticketAttrs = {
    title: 'Test ticket',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  const ticket = Ticket.build(ticketAttrs);
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 20 });

  await firstInstance!.save();
  try {
    await secondInstance!.save();
  } catch (error) {
    return;
  }

  throw new Error('Should not reach to this point');
});
