import React from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import CardGroup from '@components/Card/CardGroup';

interface Event {
  id: string;
  url: string;
  from: string;
  color: string;
  when: string;
  name: string;
  venue: string;
  image: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  description: string;
  address: string;
  accessibility: string;
  coverImage: string;
  events: Event[];
}

interface PageProps {
  params: { url: string };
}

async function fetchVenueData(url: string): Promise<Venue> {
  const res = await fetch(`http://localhost:5000/api/events/${url}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch venue data');
  }

  return res.json();
}

const Page = async ({ params }: PageProps) => {
  const venue = await fetchVenueData(params.url);

  return (
    <Master>
      <div className="blur-cover">
        <div
          style={{ backgroundImage: `url("${venue.coverImage}")` }}
          className="event-cover cover-image flex flex-v-center flex-h-center"
        />
        <div className="cover-info">
          <div
            style={{ backgroundImage: `url("${venue.coverImage}")` }}
            className="cover-image image"
          />
          <Heading type={1} color="white" text={venue.name} />
          <Heading type={6} color="white" text={venue.location} />
        </div>
      </div>

      <Section className="white-background">
        <div className="container">
          <div className="venue-details">
            <Heading type={4} color="gray" text="Venue details" />
            <div className="paragraph-container gray">
              <p>{venue.description}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="white-background">
        <div className="container">
          <Heading type={6} color="gray" text="Address" />
          <div className="paragraph-container">
            <p className="gray">{venue.address}</p>
          </div>
          <Heading type={6} color="gray" text="How to get there?" />
          <div className="paragraph-container">
            <p className="gray">
              <a target="_blank" rel="noopener noreferrer" href="/" className="blue">
                Get directions
              </a>
              &nbsp; &bull; &nbsp;
              <a target="_blank" rel="noopener noreferrer" href="/" className="blue">
                Show in map
              </a>
            </p>
          </div>
          <Heading type={6} color="gray" text="Accessibility information" />
          <div className="paragraph-container">
            <p className="gray">{venue.accessibility}</p>
          </div>
        </div>
      </Section>

      <CardGroup url="list" title="Events in this venue" color="gray" background="gray">
        {venue.events.length === 0 ? (
          <p>No events found for this venue.</p>
        ) : (
          venue.events.map((event) => (
            <EventCard
              key={event.id}
              url={event.url}
              from={event.from}
              color={event.color}
              when={event.when}
              name={event.name}
              venue={event.venue}
              image={event.image}
            />
          ))
        )}
      </CardGroup>
    </Master>
  );
};

export default Page;
