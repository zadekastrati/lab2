export interface Event {
  id: number;
  name: string;
  photo: string;
  date: string;
  location: string;
  price: number;
  categoryId: number; 
}

// Fetch all events from backend
export const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch('http://localhost:5000/api/events');

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  console.log('Fetched events data:', data);

  // Adjust this based on backend response shape
  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.events)) {
    return data.events;
  } else {
    throw new Error('Invalid events data format');
  }
};

// Create a new event by sending FormData (including photo file)
export async function createEvent(formData: FormData) {
  const response = await fetch('http://localhost:5000/api/events', {
    method: 'POST',
    body: formData, 
  });

  if (!response.ok) {
    let errorMsg = 'Error creating event';
    try {
      const data = await response.json();
      if (data.message) errorMsg = data.message;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

// Delete an event by its ID
export async function deleteEvent(eventId: number) {
  const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorMsg = 'Error deleting event';
    try {
      const data = await response.json();
      if (data.message) errorMsg = data.message;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

export const updateEvent = async (eventId: number, formData: FormData): Promise<void> => {
  const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update event');
  }
};
export const fetchEventsByCategory = async (categoryId: number): Promise<Event[]> => {
  const response = await fetch(`http://localhost:5000/api/events?categoryId=${categoryId}`);

  if (!response.ok) {
    let errorMsg = 'Error fetching events for category';
    try {
      const data = await response.json();
      if (data.message) errorMsg = data.message;
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
};

