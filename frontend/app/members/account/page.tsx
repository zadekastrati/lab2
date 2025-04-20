'use client';

import { useEffect, useState } from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonGroup from '@components/Button/ButtonGroup';
import ButtonGroupItem from '@components/Button/ButtonGroupItem';
import FormMain from './components/FormMain';
import Loader from '@components/Loader/Loader';
import Request, { type IRequest, type IResponse } from '@utils/Request';

interface ExtendedRequest extends IRequest {
  headers?: Record<string, string>;
}

const Page: React.FC = () => {
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return; // ⛔ Server-side, skip
  
    const fetchUserData = async () => {
      const userToken = localStorage.getItem('authToken');
      console.log('Token from localStorage:', localStorage.getItem('authToken'));
      if (!userToken) {
        console.error('User token is not available');
        return;
      }
  
      const parameters: ExtendedRequest = {
        url: 'users/me',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      };
  
      const res: IResponse = await Request.getResponse(parameters);
      console.log('Response from /v1/users/me:', res);
      if (res.status === 200 && res.data && res.data.results) {
        const { name, email } = res.data.results;
        setUserData({ name: name || '', email: email || '' });
      } else {
        console.error('Failed to load user data', res);
      }
  
      setLoading(false);
    };
  
    fetchUserData();
  }, []);
  

  if (loading) {
    return <Loader type="page" color="gray" text="Loading user data..." />;
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
