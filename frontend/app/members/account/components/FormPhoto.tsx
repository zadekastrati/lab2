'use client';

import { useState } from 'react';
import useAlert from '@hooks/useAlert';
import Loader from '@components/Loader/Loader';
import ProfilePhoto from '@components/Profile/ProfilePhoto';
import Request, { type IRequest, type IResponse } from '@utils/Request';

interface IProps {
  data: string;
}

const FormPhoto: React.FC<IProps> = ({ data }) => {
  const { showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    hideAlert();
    setLoading(true);

    const imageInput = (e.target as HTMLFormElement).image.files[0];
    const formData = new FormData();
    formData.append('profileImage', imageInput);
  
    const parameters: IRequest = {
      url: 'users/photo',
      method: 'POST',
      postData: formData,
    };

    const res: IResponse = await Request.getResponse(parameters);

    if (res.status !== 200) {
      showAlert({ type: 'error', text: res.data.title ?? 'Error uploading photo' });
    } else {
      showAlert({ type: 'success', text: 'Profile photo updated!' });
    }

    setLoading(false);
  };

  if (loading) return <Loader type='inline' color='gray' text='Uploading...' />;

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className='upload-picture'>
        <input type='file' name='image' id='image' className='input-file' accept='.jpg,.jpeg,.png' />
        <label htmlFor='image'>
          <span className='material-symbols-outlined'>add_a_photo</span>
        </label>
        <ProfilePhoto image={data} size='large' />
        <span className='muted'>click picture to change</span>
      </div>
    </form>
  );
};

export default FormPhoto;
