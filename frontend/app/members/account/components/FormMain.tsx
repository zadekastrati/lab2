'use client';

import { useState } from 'react';
import Link from 'next/link'; // Corrected import
import useAlert from '@hooks/useAlert';
import Input from '@components/Form/Input';
import Button from '@components/Button/Button';
import Loader from '@components/Loader/Loader';
import ButtonLink from '@components/Button/ButtonLink';
import Request, { type IRequest, type IResponse } from '@utils/Request';

interface IProps {
  data: {
    name: string;
    email: string;
  };
}

interface IFormProps {
  name: string;
  email: string;
}

const FormMain: React.FC<IProps> = ({ data }) => {
  const { showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IFormProps>({
    name: data.name,
    email: data.email,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<any> => {
    e.preventDefault();
    hideAlert();
    setLoading(true);

    const parameters: IRequest = {
      url: 'users/update',
      method: 'POST',
      postData: {
        name: formValues.name,
        email: formValues.email,  // Add email if you want to update it as well
      },
    };

    const req: IResponse = await Request.getResponse(parameters);

    const { status, data } = req;

    if (status === 200) {
      showAlert({ type: 'success', text: 'Profile updated successfully' });
    } else {
      showAlert({ type: 'error', text: data.title ?? 'Update failed' });
    }

    setLoading(false);
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
              <label htmlFor='name'>Name</label>
            </div>
            <Input
              type='text'
              name='name'
              value={formValues.name}
              maxLength={64}
              placeholder='Enter your name'
              required
              onChange={handleChange}
            />
          </div>
        </div>

        <div className='form-line'>
          <div className='one-line'>
            <div className='label-line flex flex-v-center flex-space-between'>
              <label htmlFor='email'>E-mail address</label>
              <Link href='/members/email' className='blue'>
                Change e-mail
              </Link>
            </div>
            <Input
              type='email'
              name='email'
              value={formValues.email}
              maxLength={128}
              placeholder='Enter your e-mail address'
              required
              onChange={handleChange}
            />
          </div>
        </div>

        <div className='form-buttons'>
          <ButtonLink color='gray-overlay' text='Sign out' url='members/signout' />
          <Button type='submit' color='blue-filled' text='Update profile' />
        </div>
      </div>
    </form>
  );
};

export default FormMain;
