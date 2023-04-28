import React, { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  const handleClick = (e) => {
    doRequest();
  };

  return (
    <div className='container mt-4'>
      <div className='row'>
        <div className='col-md-6 mx-auto max-w-2xl'>
          <div className='card'>
            <div className='card-body'>
              <h2 className='card-title'>{ticket.title}</h2>
              <h5 className='card-text'>
                Price: <span>${ticket.price}</span>
              </h5>
              <h5 className='card-text'>
                Status:{' '}
                {ticket.orderId ? (
                  <span className='text-danger'>Reserved</span>
                ) : (
                  <span className='text-success'>Available</span>
                )}
              </h5>
              {errors}
              {!ticket.orderId && (
                <button
                  className='btn btn-primary'
                  onClick={handleClick}
                >
                  Purchase
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return {
    ticket: data,
  };
};
export default TicketShow;
