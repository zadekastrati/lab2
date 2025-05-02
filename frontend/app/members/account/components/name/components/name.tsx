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
  name: string;
}

interface ITokenPayload {
  userId: string;
}

const NameForm: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();

  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    name: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: ITokenPayload = decodeJwt(token);
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

    // Validate name field
    if (!formValues.name.trim()) {
      showAlert({ type: 'error', text: 'Name cannot be empty' });
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
      // Log the userId and token for debugging
      console.log("Making API request with userId:", finalUserId, "and token:", token);

      const response = await axios.put(
        `http://localhost:5000/api/users/${finalUserId}`,
        { name: formValues.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showAlert({ type: 'success', text: 'Name updated successfully.' });
        console.log('Name update successful'); // Success log
      } else {
        showAlert({ type: 'error', text: 'Name update failed. Please try again.' });
      }
    } catch (error: any) {
      console.error('Request failed:', error);
      const message =
        error?.response?.data?.message || 'An unexpected error occurred. Please try again later.';
      showAlert({ type: 'error', text: message });
    }

    setLoading(false);
  };

  // Helper function to decode JWT token
  const decodeJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  if (loading) {
    return <Loader type="inline" color="gray" text="Hang on a second" />;
  }

  return (
    <form className="form shrink" noValidate onSubmit={handleSubmit}>
      <div className="form-elements">
        <div className="form-line">
          <div className="one-line">
            <div className="label-line">
              <label htmlFor="name">Your Name</label>
            </div>
            <Input
              type="text"
              name="name"
              value={formValues.name}
              maxLength={128}
              placeholder="Enter your full name"
              required
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-buttons">
          <ButtonLink color="gray-overlay" text="Go back" url="members/account" />
          &nbsp; &nbsp;
          <Button type="submit" color="blue-filled" text="Submit" />
        </div>
      </div>
    </form>
  );
};

export default NameForm;
