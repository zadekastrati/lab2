'use client';
import { useState, useEffect } from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import { fetchEvents } from '@services/eventService';

import FormSearch from './home/components/FormSearch';
import CircleButtons from './home/components/CircleButtons';

interface Event {
  id: number;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/';

const Page: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents();
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    getAllEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  if (events.length === 0) return <p>No upcoming events found.</p>;

  return (
    <Master>
          <button
      onClick={() => alert('Add event button clicked!')}
      style={{
        position: 'absolute',
        top: '620px',
        left: '1350px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#0070f3',
        color: 'white',
        fontSize: '36px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Add Event"
      title="Add Event"
    >
      +
    </button>
    <Section className='white-background'>
      <div className='container'>
        <div className='center'>
          <Heading type={1} color='gray' text='Discover' />
          <p className='gray'>Discover, search and filter best events in London.</p>
        </div>
      </div>

      <div className='center'>
        <div className='container'>
          <div className='top-search'>
            <FormSearch />
          </div>
        </div>
        <div className='circle-buttons'>
          <CircleButtons />
        </div>
      </div>
    </Section>
      <Section className='white-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Discover' />
            <p className='gray'>Discover, search and filter best events in London.</p>
          </div>
        </div>
      </Section>

      <Section className='list-cards'>
        <div className='container center'>
          {events.map((event) => (
            <EventCard
              key={event.id}
              url={event.id.toString()}
              from={event.price.toString()}
              color='blue'
              when={new Date(event.date).toLocaleString()}
              name={event.name}
              venue={event.location}
              image={event.photo}
            />
          ))}
        </div>
      </Section>
    </Master>
  );
};
export default Page;
