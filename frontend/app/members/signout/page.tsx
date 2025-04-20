// app/members/signout/page.tsx
'use client'; // Add this to mark this as a client-side component

import { useEffect } from 'react';
import { metadata } from './metadata'; // Import the metadata here
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => {
  useEffect(() => {
    // Clear auth-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }, []);

  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Signed out' />
            <p className='gray form-information'>
              You are successfully signed out and you can safely return to the home page.
            </p>

            <div className='button-container'>
              <ButtonLink color='gray-overlay' text='Return to home' url='/' />
              &nbsp; &nbsp;
              <ButtonLink color='blue-filled' text='Sign in again' url='/members/signin' />
            </div>
          </div>
        </div>
      </Section>
    </Master>
  );
};

export default Page;
