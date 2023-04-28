import Router from 'next/router';
import React, { useState } from 'react';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);
    setPrice(value.toFixed(2));
  };

  return (
    <div className='container'>
      <h2 className='my-4 text-center'>New Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label
            htmlFor='title'
            className='font-weight-bold'
          >
            Title
          </label>
          <input
            type='text'
            className='form-control rounded-1'
            id='title'
            placeholder='Enter title'
            style={{ borderColor: '#5cb85c', fontSize: '1.25rem' }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className='form-group mb-4'>
          <label
            htmlFor='price'
            className='font-weight-bold'
          >
            Price in ($)
          </label>
          <input
            type='number'
            className='form-control rounded-1'
            id='price'
            placeholder='Enter price'
            style={{ borderColor: '#5cb85c', fontSize: '1.25rem' }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={onBlur}
          />
        </div>
        {errors}
        <button
          type='submit'
          className='btn btn-primary rounded-1 px-4 py-2'
          style={{
            backgroundColor: '#5cb85c',
            borderColor: '#5cb85c',
            fontSize: '1.25rem',
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewTicket;
