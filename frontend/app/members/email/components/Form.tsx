'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import ButtonLink from '@components/Button/ButtonLink';

interface IFormProps {
  email: string;
  emailAgain: string;
}

interface ITokenPayload {
  userId: string;
}

const Form: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    email: '',
    emailAgain: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: ITokenPayload = decodeJwt(token); // Use the custom decodeJwt function
        setUserId(decoded.userId);
        localStorage.setItem('userId', decoded.userId);
      } catch (error) {
        console.error('Invalid token:', error);
        showAlert({ type: 'error', text: 'Invalid session. Please log in again.' });
      }
    } else {
      console.warn('No token found');
      showAlert({ type: 'error', text: 'Please log in to continue.' });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    hideAlert();

    if (formValues.email !== formValues.emailAgain) {
      showAlert({ type: 'error', text: "Emails don't match" });
      return;
    }

    const token = localStorage.getItem('authToken');
    const finalUserId = userId || localStorage.getItem('userId');

    if (!finalUserId || !token) {
      showAlert({ type: 'error', text: 'Authentication error. Please log in again.' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${finalUserId}`,
        { email: formValues.email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showAlert({ type: 'success', text: 'Email updated successfully.' });
      } else {
        showAlert({ type: 'error', text: 'Email update failed. Please try again.' });
      }
    } catch (error: any) {
      console.error('Request failed:', error);
      const message =
        error?.response?.data?.message || 'An unexpected error occurred. Please try again later.';
      showAlert({ type: 'error', text: message });
    }

    setLoading(false);
  };

  // Function to decode JWT token
  const decodeJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Make the base64 URL safe
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  };

  if (loading) {
    return <Loader type='inline' color='gray' text='Hang on a second' />;
  }

  return (
    <form className='form shrink' noValidate onSubmit={handleSubmit}>
      <div className='form-elements'>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='email'>E-mail address</label>
            </div>
            <Input
              type='email'
              name='email'
              value={formValues.email}
              maxLength={128}
              placeholder='Enter your new e-mail address'
              required
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line'>
              <label htmlFor='emailAgain'>Confirm e-mail address</label>
            </div>
            <Input
              type='email'
              name='emailAgain'
              value={formValues.emailAgain}
              maxLength={128}
              placeholder='Re-enter your new e-mail address'
              required
              onChange={handleChange}
            />
          </div>
        </div>
        <div className='form-buttons'>
          <ButtonLink color='gray-overlay' text='Go back' url='members/account' />
          &nbsp; &nbsp;
          <Button type='submit' color='blue-filled' text='Submit' />
        </div>
      </div>
    </form>
  );
};

export default Form;
