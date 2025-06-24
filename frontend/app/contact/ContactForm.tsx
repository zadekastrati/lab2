import React, { useState, useEffect } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, subject, message }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      setSuccess(true);
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError('Error sending message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="max-w-lg mx-auto mb-6 rounded border border-green-400 bg-green-100 px-6 py-4 text-green-700 shadow"
      >
        Thank you for contacting us! We will reply soon.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto rounded-lg border border-gray-300 bg-white p-8 shadow-lg"
      noValidate
    >
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 shadow"
        >
          {error}
        </div>
      )}

      <label htmlFor="fullName" className="mb-2 block font-semibold text-gray-700">
        Full Name
      </label>
      <input
        id="fullName"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        placeholder="Your full name"
        className="mb-6 w-full rounded border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 pad"
      />

      <label htmlFor="email" className="mb-2 block font-semibold text-gray-700">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
        className="mb-6 w-full rounded border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label htmlFor="subject" className="mb-2 block font-semibold text-gray-700">
        Subject
      </label>
      <input
        id="subject"
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        placeholder="Subject of your message"
        className="mb-6 w-full rounded border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <label htmlFor="message" className="mb-2 block font-semibold text-gray-700">
        Message
      </label>
      <textarea
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={6}
        placeholder="Write your message here..."
        className="mb-8 w-full resize-y rounded border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
      ></textarea>

      <button
  type="submit"
  disabled={loading}
  className="btn btn-gray-filled"
  style={{
    cursor: loading ? 'not-allowed' : 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: loading ? '#718096' : '#374151',// ngjyrë gri e errët si gray-filled
    color: 'white',
    fontWeight: 600,
    width: '100%',
  }}
>
  {loading ? 'Sending...' : 'Send'}
</button>

    </form>
  );
};

export default ContactForm;
