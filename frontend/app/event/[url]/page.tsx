'use client';

import { useEffect, useState } from 'react';
import CardGroup from '@components/Card/CardGroup';
import EventCard from '@components/Card/EventCard';
import { fetchEvents } from '@services/eventService';

interface Event {
  id: number;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error(error);
      }
    };

    getEvents();
  }, []);

  return (
    <CardGroup
      title='Upcoming Events'
      url='/events'
      color='blue'
      background='white'
    >
      {events.map((event) => (
        <EventCard
          key={event.id}
          url={event.id.toString()}
          from={event.price.toString()}
          when={new Date(event.date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          name={event.name}
          venue={event.location}
          image={event.photo}
          color='blue'
        />
      ))}
    </CardGroup>
  );
};

export default EventsPage;
