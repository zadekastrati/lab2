'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import Master from '@components/Layout/Master';
import CircleButtons from '../home/components/CircleButtons';
import EventCard from '@components/Card/EventCard';

interface Event {
  id: string;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
  categoryId: string;
  url?: string;
}

interface Category {
  id: string;
  name: string;
}

interface NewEvent {
  name: string;
  photo: File | null;
  date: string;
  location: string;
  price: string;
  categoryId: string;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/';

const EventsPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('category');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    name: '',
    photo: null,
    date: '',
    location: '',
    price: '',
    categoryId: ''
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/events';
        const params = new URLSearchParams();
        
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (categoryId) {
          params.append('categoryId', categoryId);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        console.log('Events data:', data);
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, categoryId]);

  // Handle edit event
  const handleEdit = (eventId: string) => {
    const eventToEdit = events.find(ev => ev.id === eventId);
    if (!eventToEdit) {
      alert('Event not found!');
      return;
    }
    setNewEvent({
      name: eventToEdit.name,
      photo: null,
      date: new Date(eventToEdit.date).toISOString().split('T')[0],
      location: eventToEdit.location,
      price: eventToEdit.price.toString(),
      categoryId: eventToEdit.categoryId
    });
    setEditingEventId(eventId);
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setNewEvent(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  // Handle form submission
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

      let response;
      if (editingEventId) {
        response = await fetch(`http://localhost:5000/api/events/${editingEventId}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        if (!photo) return setSubmitError('Please select a photo.');
        response = await fetch('http://localhost:5000/api/events', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      // Refresh events list
      const refreshResponse = await fetch('http://localhost:5000/api/events');
      const refreshData = await refreshResponse.json();
      setEvents(refreshData.events || []);
      
      setShowEditModal(false);
      setEditingEventId(null);
      setNewEvent({
        name: '',
        photo: null,
        date: '',
        location: '',
        price: '',
        categoryId: ''
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (eventId: string) => {
    setDeletingEventId(eventId);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingEventId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/events/${deletingEventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Remove the deleted event from the state
      setEvents(events.filter(event => event.id !== deletingEventId));
      setShowDeleteModal(false);
      setDeletingEventId(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  // Get current category name if categoryId is present
  const currentCategory = categoryId 
    ? categories.find(cat => cat.id.toString() === categoryId)?.name 
    : null;

  // Styles
  const floatingButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '172px',
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
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    marginRight: '8px',
    color: '#666',
    transition: 'color 0.3s ease'
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

  return (
    <Master>
    <Section>
      <div className="container">
        <Heading 
          type={1} 
          color="gray" 
            text={
              categoryId
                ? 'Category Events'
                : searchQuery 
                  ? `Search Results for "${searchQuery}"`
                  : 'All Events'
            } 
          />

          {/* Category filter buttons */}
          <div className="circle-buttons">
            <CircleButtons />
          </div>
        
        {loading && (
          <div className="loading-state">
            <span className="material-symbols-outlined spinning">hourglass_empty</span>
            <p>Loading events...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="no-results">
              <p>
                {categoryId
                  ? 'No events found in this category'
                  : searchQuery 
                    ? `No events found for "${searchQuery}"`
                    : 'No events available'}
              </p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
            <div className="events-grid" style={cardContainerStyle}>
            {events.map((event) => (
                <EventCard
                  key={event.id}
                  url={event.id.toString()}
                  from={event.price.toString()}
                  color="blue"
                  when={new Date(event.date).toLocaleString()}
                  name={event.name}
                  venue={event.location}
                  image={event.photo.startsWith('http') ? event.photo : `${BASE_IMAGE_URL}${event.photo}`}
                  actions={
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(event.id);
                        }}
                        style={iconButtonStyle}
                        aria-label="Edit event"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteClick(event.id);
                        }}
                        style={{ ...iconButtonStyle, color: '#dc3545' }}
                        aria-label="Delete event"
                      >
                        <FaTrash />
                      </button>
                    </>
                  }
                />
            ))}
          </div>
        )}
      </div>
    </Section>

      {/* Edit Modal */}
      {showEditModal && (
        <div role='dialog' aria-modal='true' style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0 }}>{editingEventId ? 'Edit Event' : 'Add New Event'}</h2>
              <button
                onClick={() => setShowEditModal(false)}
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
                  min='0'
                  step='0.01'
                  name='price'
                  value={newEvent.price}
                  onChange={handleInputChange}
                  style={inputStyle}
                  disabled={submitLoading}
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
                  <option value=''>Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              {submitError && (
                <div style={{ color: 'red', marginBottom: '10px' }}>
                  {submitError}
                </div>
              )}
              <button
                type='submit'
                disabled={submitLoading}
                style={submitButtonStyle}
              >
                {submitLoading ? 'Saving...' : editingEventId ? 'Update Event' : 'Add Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div role="dialog" aria-modal="true" style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '400px', textAlign: 'center' }}>
            <h3>Are you sure you want to delete this event?</h3>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleDeleteConfirm}
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

export default EventsPage; 