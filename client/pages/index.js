import React from 'react';
import Link from 'next/link';

const Landing = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>${ticket.price.toFixed(2)}</td>
      <td>
        <Link
          href='/tickets/[ticketId]'
          as={`/tickets/${ticket.id}`}
        >
          <a className='btn btn-primary'>View</a>
        </Link>
      </td>
    </tr>
  ));

  return (
    <div className='container'>
      <h1>Ticket List</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

Landing.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default Landing;
