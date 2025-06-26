'use client';

import React, { useEffect, useState } from 'react';
import CardGroup from '@components/Card/CardGroup';
import EventCard from '@components/Card/EventCard';
import { fetchEvents } from '../../../services/eventService';

interface Event {
  id: number;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/';

const EventsPage: React.FC = () => {
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
    <CardGroup title="Upcoming Events" url="/events" color="blue" background="white">
      {events.map(event => (
        <EventCard
          key={event.id}
          url={`/events/${event.id}`}
          from={event.price.toFixed(2)}
          when={new Date(event.date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          name={event.name}
          venue={event.location}
          image={event.photo.startsWith('http') ? event.photo : BASE_IMAGE_URL + event.photo}
          color="blue"
        />
      ))}
    </CardGroup>
  );
};

export default EventsPage;
