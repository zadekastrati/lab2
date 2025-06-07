'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// components
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import Master from '@components/Layout/Master';

interface Event {
  id: string;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
  categoryId: string;
  url?: string;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/';

const EventsPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/events${searchQuery ? `?search=${searchQuery}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        console.log('Events data:', data);
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery]);

  return (
    <Master>
      <Section>
        <div className="container">
          <Heading 
            type={1} 
            color="gray" 
            text={searchQuery ? `Search Results for "${searchQuery}"` : 'All Events'} 
          />
          
          {loading && (
            <div className="loading-state">
              <span className="material-symbols-outlined spinning">hourglass_empty</span>
              <p>Loading events...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="no-results">
              <p>{searchQuery ? `No events found for "${searchQuery}"` : 'No events available'}</p>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="events-grid">
              {events.map((event) => {
                // Always use ID for consistent linking
                const eventUrl = event.id.toString();
                return (
                  <Link href={`/event/${eventUrl}`} key={event.id} className="event-card">
                    <img 
                      src={event.photo.startsWith('http') ? event.photo : `${BASE_IMAGE_URL}${event.photo}`} 
                      alt={event.name} 
                      className="event-image" 
                    />
                    <div className="event-details">
                      <h3>{event.name}</h3>
                      <p className="event-location">
                        <span className="material-symbols-outlined">location_on</span>
                        {event.location}
                      </p>
                      <p className="event-date">
                        <span className="material-symbols-outlined">calendar_today</span>
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <p className="event-price">
                        <span className="material-symbols-outlined">euro</span>
                        £{typeof event.price === 'number' ? event.price : Number(event.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </Master>
  );
};

export default EventsPage; 