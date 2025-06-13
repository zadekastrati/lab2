'use client';

import React, { useState, useEffect, useRef } from 'react';
import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import EventCard from '@components/Card/EventCard';
import FormSearch from './home/components/FormSearch';
import CircleButtons from './home/components/CircleButtons';
import { fetchEvents, createEvent, deleteEvent, updateEvent } from '@services/eventService';
import { fetchCategories } from '@services/categoryService';
import { FaEdit, FaTrash } from 'react-icons/fa';
const EditIcon = FaEdit as unknown as React.FC;
const TrashIcon = FaTrash as unknown as React.FC;

interface Event {
  id: number;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/';

const Page: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);

  const [newEvent, setNewEvent] = useState({
    name: '',
    photo: null as File | null,
    date: '',
    location: '',
    price: '',
    categoryId: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, categoriesData] = await Promise.all([fetchEvents(), fetchCategories()]);
        setEvents(eventsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setNewEvent((prev) => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const resetForm = () => {
    setNewEvent({ name: '', photo: null, date: '', location: '', price: '', categoryId: '' });
    setSubmitError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (!showModal) resetForm();
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const { name, photo, date, location, price, categoryId } = newEvent;

    if (!name.trim()) return setSubmitError('Name is required.');
    if (!date) return setSubmitError('Date is required.');
    if (!location.trim()) return setSubmitError('Location is required.');
    if (!price || isNaN(Number(price)) || Number(price) < 0)
      return setSubmitError('Valid positive price is required.');
    if (!categoryId) return setSubmitError('Category is required.');

    try {
      setSubmitLoading(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      if (photo) formData.append('photo', photo);
      formData.append('date', date);
      formData.append('location', location.trim());
      formData.append('price', Number(price).toString());
      formData.append('categoryId', categoryId);

      if (editingEventId) {
        await updateEvent(editingEventId, formData);
      } else {
        if (!photo) return setSubmitError('Please select a photo.');
        await createEvent(formData);
      }

      const updatedEvents = await fetchEvents();
      setEvents(updatedEvents);
      setShowModal(false);
      resetForm();
      setEditingEventId(null);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save event.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (eventId: number) => {
    setDeleteEventId(eventId);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!deleteEventId) return;

    try {
      await deleteEvent(deleteEventId);
      const updatedEvents = await fetchEvents();
      setEvents(updatedEvents);
    } catch {
      alert('Failed to delete event.');
    } finally {
      setShowDeleteModal(false);
      setDeleteEventId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteEventId(null);
  };

  const handleEdit = (eventId: number) => {
    const eventToEdit = events.find((ev) => ev.id === eventId);

    if (!eventToEdit) {
      alert('Event not found!');
      return;
    }
    setNewEvent({
      name: eventToEdit.name,
      photo: null,
      date: eventToEdit.date.split('T')[0],
      location: eventToEdit.location,
      price: eventToEdit.price.toString(),
      categoryId: eventToEdit.categoryId ? eventToEdit.categoryId.toString() : '',
    });

    setEditingEventId(eventId);

    setShowModal(true);
  };

  // Render logic
  if (loading) return <p>Loading events...</p>;
  // if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <Master>
      <button onClick={() => setShowModal(true)} style={floatingButtonStyle} aria-label='Add Event'>
        +
      </button>

      <Section className='white-background'>
        <div className='container'>
          <div className='center'>
            <Heading type={1} color='gray' text='Discover' />
            <p className='gray'>Discover, search and filter best events in London.</p>
          </div>
          <div className='center'>
            <div className='top-search'>
              <FormSearch />
            </div>
            <div className='circle-buttons'>
              <CircleButtons />
            </div>
          </div>
        </div>
      </Section>

      <Section className='list-cards'>
        <div className='container center' style={cardContainerStyle}>
          {events.map((event) => (
            <div key={event.id} style={{ marginBottom: '20px' }}>
              <EventCard
                url={event.id.toString()}
                from={event.price.toString()}
                color='blue'
                when={new Date(event.date).toLocaleString()}
                name={event.name}
                venue={event.location}
                image={BASE_IMAGE_URL + event.photo}
                actions={
                  <>
                    <button
                      onClick={() => handleEdit(event.id)}
                      aria-label='Edit'
                      style={iconButtonStyle}
                    >
                      {React.createElement(EditIcon)}
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      aria-label='Delete'
                      style={{ ...iconButtonStyle, color: '#dc3545' }}
                    >
                      {React.createElement(TrashIcon)}
                    </button>
                  </>
                }
              />
            </div>
          ))}
        </div>
      </Section>

      {showModal && (
        <div role='dialog' aria-modal='true' style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0 }}>{editingEventId ? 'Edit Event' : 'Add New Event'}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={closeButtonStyle}
                disabled={submitLoading}
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <label>
                Name*
                <input
                  type='text'
                  name='name'
                  value={newEvent.name}
                  onChange={handleInputChange}
                  style={inputStyle}
                  disabled={submitLoading}
                  required
                />
              </label>
              <label>
                Photo*
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '10px 0' }}
                  ref={fileInputRef}
                  disabled={submitLoading}
                />
              </label>
              <label>
                Date*
                <input
                  type='date'
                  name='date'
                  value={newEvent.date}
                  onChange={handleInputChange}
                  style={inputStyle}
                  disabled={submitLoading}
                  required
                />
              </label>
              <label>
                Location*
                <input
                  type='text'
                  name='location'
                  value={newEvent.location}
                  onChange={handleInputChange}
                  style={inputStyle}
                  disabled={submitLoading}
                  required
                />
              </label>
              <label>
                Price (£)*
                <input
                  type='number'
                  name='price'
                  value={newEvent.price}
                  onChange={handleInputChange}
                  style={inputStyle}
                  disabled={submitLoading}
                  min={0}
                  step={0.01}
                  required
                />
              </label>
              <label>
                Category*
                <select
                  name='categoryId'
                  value={newEvent.categoryId}
                  onChange={handleInputChange}
                  style={inputStyle}
                  disabled={submitLoading}
                  required
                >
                  <option value=''>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
              <button type='submit' disabled={submitLoading} style={submitButtonStyle}>
                {submitLoading
                  ? editingEventId
                    ? 'Updating...'
                    : 'Adding...'
                  : editingEventId
                    ? 'Update Event'
                    : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div role="dialog" aria-modal="true" style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '400px', textAlign: 'center' }}>
            <h3>Are you sure you want to delete this event?</h3>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={confirmDelete}
                style={{ ...submitButtonStyle, marginRight: '10px', backgroundColor: '#dc3545' }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={submitButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Master>
  );
};

// Styles
const floatingButtonStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '25px',
  right: '25px',
  width: '60px',
  height: '60px',
  fontSize: '32px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  zIndex: 999,
};

const iconButtonStyle: React.CSSProperties = {
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '18px',
  marginRight: '10px',
  color: '#007bff',
  padding: 0,
  verticalAlign: 'middle',
};
const cardContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px',
};
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '8px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  lineHeight: 1,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box',
};

const submitButtonStyle: React.CSSProperties = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
};

export default Page;
