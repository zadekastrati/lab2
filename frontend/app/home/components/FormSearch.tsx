'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// hooks
import useAlert from '@hooks/useAlert';

// components
import Input from '@components/Form/Input';

// interfaces
interface IFormProps {
  keyword: string;
}

const FormSearch: React.FC = () => {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [formValues, setFormValues] = useState<IFormProps>({
    keyword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Handles the change event for form inputs.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event object from the input change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  /**
   * Handles the form submission event.
   *
   * Prevents the default form submission behavior, checks if the keyword input is valid (minimum 3 characters),
   * and performs the search if the input is valid.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The event object from the form submission.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const { keyword } = formValues;

    if (keyword === '' || keyword.length < 3) {
      showAlert({ type: 'error', text: 'Please enter minimum 3 characters for search.' });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/events?search=${encodeURIComponent(keyword)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      
      // Store the search results in localStorage
      localStorage.setItem('searchResults', JSON.stringify(data.events));
      
      // Navigate to the results page
      router.push(`/events?search=${encodeURIComponent(keyword)}`);
    } catch (error) {
      showAlert({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred while searching' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className='search-inputs flex flex-h-center flex-space-between'>
        <Input
          type='text'
          name='keyword'
          value={formValues.keyword}
          maxLength={64}
          placeholder='Search by event name or location...'
          required
          onChange={handleChange}
          disabled={loading}
        />
        <button type='submit' disabled={loading}>
          <span className='material-symbols-outlined'>
            {loading ? 'hourglass_empty' : 'search'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default FormSearch;
