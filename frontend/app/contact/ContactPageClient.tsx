'use client';

import React, { useState } from 'react';

// components
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';
import ContactForm from './ContactForm'; // Rregullo path sipas vendndodhjes së ContactForm.tsx

const ContactPageClient: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <Master>
      <Section className="white-background">
        <div className="container">
          <div className="padding-bottom center">
            <Heading type={1} color="gray" text="Contact us" />
            <p className="gray form-information">
              Please feel free to contact us through the following communication channels for any
              questions, concerns, or suggestions you may have.
            </p>
          </div>
        </div>
      </Section>

      <Section className="gray-background">
        <div className="container">
          <div className="center">
            <Heading type={5} color="gray" text="Customer service" />
            <p className="gray form-information">
              Our customer service is available Monday through Friday from <strong>9:00 AM</strong> to{' '}
              <strong>6:00 PM</strong>, and on weekends from <strong>10:00 AM</strong> to{' '}
              <strong>6:00 PM</strong>. Please click the button below for live assistance.
            </p>
            <div className="button-container">
              <ButtonLink
                color="gray-overlay"
                text="Live assistance"
                rightIcon="arrow_forward"
                url=""
              />
              &nbsp; &nbsp;
              {/* Butoni që tregon formën */}
              <button
                onClick={handleShowForm}
                className="btn btn-gray-filled"
                style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none' }}
              >
                Drop us an e-mail &nbsp; <span className="material-icons"></span>
              </button>
            </div>

            {/* Shfaq formularin këtu */}
            {showForm && <ContactForm />}
          </div>
        </div>
      </Section>

      <Section className="white-background">
        <div className="container">
          <div className="center">
            <Heading type={5} color="gray" text="How can we help you?" />
            <p className="gray form-information">
              Would you like to browse through the help section to find the answer to your question
              before asking us?
            </p>
            <div className="button-container">
              <ButtonLink color="gray-filled" text="Help page" rightIcon="arrow_forward" url="help" />
            </div>
          </div>
        </div>
      </Section>

      <Section className="gray-background">
        <div className="container">
          <div className="center">
            <Heading type={5} color="gray" text="Communication details" />
            <div className="paragraph-container">
              <p className="gray">
                You can directly write us to
                <br />
                <strong>hello@modern-ticketing.com</strong>
                <br />
                <br />
                or call us at
                <br />
                <strong>+44 7445 5100000</strong>
                <br />
                <br />
                <strong>Our office address is</strong>
                <br />
                233 North Road, Southbank, W2 2UL, London, UK
              </p>
            </div>
           <div className="button-container">
  <a
    href="https://www.google.com/maps/search/?api=1&query=233+North+Road,+Southbank,+W2+2UL,+London,+UK"
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-blue-filled"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.5rem 1.25rem',
      borderRadius: '9999px', // formë rrumbullake
      textDecoration: 'none',
      color: 'white',
      backgroundColor: '#2563eb', // Tailwind blue-600
    }}
  >
    Open maps <span style={{fontSize: '1.2rem'}}>→</span>
  </a>
</div>


          </div>
        </div>
      </Section>
    </Master>
  );
};

export default ContactPageClient;
