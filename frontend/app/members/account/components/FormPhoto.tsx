// Add this at the top of your file
'use client';

import { useEffect, useState } from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';
import FormMain from './FormMain';
import Loader from '@components/Loader/Loader';
import Request, { type IRequest, type IResponse } from '@utils/Request';

interface ExtendedRequest extends IRequest {
  headers?: Record<string, string>;
}

const Page: React.FC = () => {
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're on the client-side (browser)
    if (typeof window === 'undefined') return; // Avoid server-side rendering

    const fetchUserData = async () => {
      const userToken = localStorage.getItem('authToken');
      console.log('Token from localStorage:', userToken); // Debugging token

      if (!userToken) {
        setError('No token found');
        console.error('User token is not available');
        // Redirect to login page if no token is found
        window.location.href = '/login';
        return;
      }

      const parameters: ExtendedRequest = {
        url: 'users/me',  // Make sure this matches your actual API endpoint
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      };

      try {
        const res: IResponse = await Request.getResponse(parameters);

        // Debugging the entire response object
        console.log('Response from users/me:', res);

        // Check if response has data, even if status is missing
        if (res.data) {
          const { name, email } = res.data.results || {}; // Safely access results
          if (name && email) {
            setUserData({ name, email });
          } else {
            setError('User data is incomplete');
            console.error('Incomplete user data:', res.data);
          }
        } else {
          setError('No data returned from API');
          console.error('API did not return data', res);
        }
      } catch (err: unknown) {
        // TypeScript requires type assertion for 'unknown' type
        if (err instanceof Error) {
          setError('Error fetching user data: ' + err.message);
          console.error('Error fetching user data', err);
        } else {
          setError('Unknown error occurred while fetching user data');
          console.error('Unknown error', err);
        }
      }

      setLoading(false); // Set loading to false after data is fetched
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <Loader type="page" color="gray" text="Loading user data..." />;
  }

  if (error) {
    return (
      <Master>
        <Section>
          <div className="container center">
            <p className="red">{error}</p>
          </div>
        </Section>
      </Master>
    );
  }

  if (!userData) {
    return (
      <Master>
        <Section>
          <div className="container center">
            <p className="red">Failed to load user info</p>
          </div>
        </Section>
      </Master>
    );
  }

  return (
    <Master>
      <Section className="white-background">
        <div className="container">
          <div className="center">
            <Heading type={1} color="gray" text="My account" />
            <p className="gray form-information">
              You can update your profile details here.
            </p>
            <div className="button-container">
              <ButtonGroup color="gray">
                <ButtonGroupItem url="members/tickets" text="My tickets" />
                <ButtonGroupItem url="members/account" text="My account" active />
              </ButtonGroup>
            </div>
            <div className="padding-top">
              <FormMain data={{ name: userData.name, email: userData.email }} />
            </div>
          </div>
        </div>
      </Section>
    </Master>
  );
};

export default Page;
