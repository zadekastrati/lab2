import Link from 'next/link';
import React from 'react';

// components
import Badge from '@components/Badge/Badge';
import ButtonLink from '@components/Button/ButtonLink';

// interfaces
interface IProps {
  url: string;
  from: string;
  when: string;
  name: string;
  venue: string;
  image: string;
  color: string;
  actions?: React.ReactNode;  // <-- new optional prop
}

const EventCard: React.FC<IProps> = ({
  url,
  from,
  when,
  name,
  venue,
  image,
  color,
  actions,
}) => {
  // Create URL-friendly slug if url is not provided
  const eventUrl = url || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  return (
    <div className='card'>
      <Link href={`/event/${eventUrl}`}>
        <div className='card-title'>
          <h3>{name}</h3>
        </div>
        <div
          className='card-image'
          style={{
            backgroundImage: `url("${image}")`,
          }}
        >
          <Badge color={color} text='NEW' />
        </div>
        <div className='card-info'>
          <p>
            <span className='material-symbols-outlined'>event</span> {when}
          </p>
          <p>
            <span className='material-symbols-outlined'>apartment</span> {venue}
          </p>
          <p>
            <span className='material-symbols-outlined'>local_activity</span> from{' '}
            <strong>£{from}</strong>
          </p>
        </div>
      </Link>
      <div className='card-buttons'>
        {actions ? (
          actions
        ) : (
          <ButtonLink
            color={`${color}-overlay`}
            text='Details'
            rightIcon='arrow_forward'
            url={`/event/${eventUrl}`}
          />
        )}
      </div>
    </div>
  );
};

export default EventCard;
