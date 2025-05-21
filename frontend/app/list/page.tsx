/* eslint-disable no-console */

'use client';

import { useEffect, useState } from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';

type Event = {
  id: number;
  name: string;
  photo: string;
  price: number;
  date: string;
  location: string;
};

const Page: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='padding-bottom center'>
            <Heading type={1} color='gray' text='Events' />
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
