'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

interface Event {
  id: number;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number | string;
  categoryId: number;
  url?: string;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/';

const EventDetailPage = () => {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get the correct image URL
  const getImageUrl = (photoPath: string | undefined) => {
    if (!photoPath) return '';
    
    try {
      // If it's already a full URL, return it
      if (photoPath.startsWith('http')) {
        return photoPath;
      }
      
      // If it starts with /uploads/, add the base URL
      if (photoPath.startsWith('/uploads/')) {
        return `http://localhost:5000${photoPath}`;
      }
      
      // Otherwise, assume it's just the filename and add the full path
      return `${BASE_IMAGE_URL}${photoPath}`;
    } catch (err) {
      console.error('Error processing image URL:', err);
      return '';
    }
  };

  // Helper function to format price
  const formatPrice = (price: number | string | undefined) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventUrl = Array.isArray(params?.url) ? params.url[0] : params?.url;
        
        if (!eventUrl) {
          throw new Error('Event URL is missing');
        }

        // Use a single endpoint that handles both numeric IDs and text searches
        const response = await fetch(`http://localhost:5000/api/events/${eventUrl}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }

        const { event: data } = await response.json();
        if (!data) {
          throw new Error('Event not found');
        }

        // Ensure all required fields are present
        setEvent({
          id: data.id,
          name: data.name || 'Untitled Event',
          photo: data.photo || '',
          date: data.date || new Date().toISOString(),
          location: data.location || 'Location TBD',
          price: data.price || 0,
          categoryId: data.categoryId || 0,
          url: data.url
        });

      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params]);

  if (loading) {
    return (
      <Master>
        <Section>
          <div className="container center">
            <div className="loading-state">
              <span className="material-symbols-outlined spinning">hourglass_empty</span>
              <p>Loading event details...</p>
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  if (error) {
    return (
      <Master>
        <Section>
          <div className="container center">
            <div className="error-state">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  if (!event) {
    return (
      <Master>
        <Section>
          <div className="container center">
            <div className="no-results">
              <p>Event not found</p>
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  const imageUrl = getImageUrl(event.photo);
  const formattedPrice = formatPrice(event.price);

  return (
    <Master>
      <div className="blur-cover">
        <div
          style={{ 
            backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
            backgroundColor: !imageUrl ? '#f0f0f0' : undefined
          }}
          className="event-cover cover-image"
        />
        <div className="cover-info">
          <div
            style={{ 
              backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
              backgroundColor: !imageUrl ? '#f0f0f0' : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="image"
          />
          <Heading type={1} color="white" text={event.name} />
          <Heading type={6} color="white" text={event.location} />
        </div>
      </div>

      <Section className="white-background">
        <div className="container">
          <div className="event-details">
            <div className="paragraph-container">
              <Heading type={4} color="gray" text="Event Details" />
              <p className="gray">
                <span className="material-symbols-outlined">calendar_today</span>
                {new Date(event.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="gray">
                <span className="material-symbols-outlined">location_on</span>
                {event.location}
              </p>
              <p className="gray">
                <span className="material-symbols-outlined">euro</span>
                Starting from £{formattedPrice}
              </p>
            </div>
            
            <div className="ticket-box">
              <div className="ticket-box-header">
                <Heading type={4} color="gray" text="Get Tickets" />
              </div>
              <div className="ticket-box-line">
                <span>Price:</span>
                <strong>£{formattedPrice}</strong>
              </div>
              <div className="ticket-box-buttons">
                <ButtonLink
                  color="blue-filled"
                  text="Buy Tickets"
                  rightIcon="arrow_forward"
                  url={`/buy?eventId=${event.id}`}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Master>
  );
};

export default EventDetailPage;