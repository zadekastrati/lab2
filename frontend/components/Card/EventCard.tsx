// @components/Card/EventCard.tsx
import React from 'react';
import Link from 'next/link';

type EventCardProps = {
  url: string;
  from: string;
  color: string;
  when: string;
  name: string;
  venue: string;
  image: string;
};

const EventCard: React.FC<EventCardProps> = ({
  url,
  from,
  color,
  when,
  name,
  venue,
  image,
}) => {
  return (
    <div className={`event-card ${color}`}>
      <Link href={`/event/${url}`}>
        <div
          className='event-card-image'
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className='event-card-content'>
          <p className='event-card-name'>{name}</p>
          <p className='event-card-venue'>{venue}</p>
          <p className='event-card-when'>{when}</p>
          <p className='event-card-price'>From £{from}</p>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
