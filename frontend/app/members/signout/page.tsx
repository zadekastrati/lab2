'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';

const Page: React.FC = () => {
  const [message, setMessage] = useState('You are successfully signed out and can safely return to the home page.');
  const searchParams = useSearchParams();

  useEffect(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    const reason = searchParams.get('reason');
    if (reason === 'expired') {
      setMessage('Your session expired. Please sign in again.');
    }
  }, [searchParams]);

  return (
    <Master>
      <Section className='white-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Signed out' />
            <p className='gray form-information'>{message}</p>
            <div className='button-container'>
              <ButtonLink color='gray-overlay' text='Return to home' url='/' />
              &nbsp;&nbsp;
              <ButtonLink color='blue-filled' text='Sign in again' url='/members/signin' />
            </div>
          </div>
        </div>
      </Section>
    </Master>
  );
};

export default Page;
