'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';


import useAlert from '@hooks/useAlert';
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';

interface ILoginFormProps {
  email: string;
  password: string;
}

interface DecodedToken {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const LoginForm: React.FC = () => {
  const { showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<ILoginFormProps>({ email: '', password: '' });

  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();
    hideAlert();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: formValues.email,
        password: formValues.password,
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);

        // Decode token to extract user info
        const decoded = jwtDecode<DecodedToken>(token);

        console.log('Decoded token:', decoded);

        localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('userId', decoded.userId.toString());

        showAlert({ type: 'success', text: 'Login successful!' });

        setTimeout(() => {
          router.push('/');
        }, 1000); // slight delay to show alert
      }
    } catch (err: any) {
      showAlert({ type: 'error', text: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // Redirect only if already logged in and not on /signin
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const path = window.location.pathname;

    // Only redirect if we're not already on a public route like /signin or /signup
    if (token && (path === '/signin' || path === '/signup')) {
      router.push('/');
    }
  }, []);

  if (loading) {
    return <Loader type="inline" color="gray" text="Logging in..." />;
  }

  return (
    <form className="form shrink" noValidate onSubmit={handleSubmit}>
      <div className="form-elements">
        <div className="form-line">
          <div className="one-line">
            <div className="label-line">
              <label htmlFor="email">E-mail address</label>
            </div>
            <Input
              type="email"
              name="email"
              value={formValues.email}
              maxLength={128}
              placeholder="Enter your e-mail address"
              required
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-line">
          <div className="label-line">
            <label htmlFor="password">Password</label>
          </div>
          <Input
            type="password"
            name="password"
            value={formValues.password}
            maxLength={64}
            placeholder="Enter your password"
            required
            onChange={handleChange}
          />
        </div>

        <div className="form-buttons">
          <Button type="submit" color="blue-filled" text="Log In" />
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
