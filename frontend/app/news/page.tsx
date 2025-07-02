'use client';
import React, { useEffect, useState } from 'react';

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
}

const initialFormState = {
  title: '',
  content: '',
  imageUrl: '',
  date: '',
};

const NewsPage: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Fetch news from backend
  const fetchNews = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/news')
      .then(res => res.json())
      .then(data => {
        setNewsList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch news');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // POST or PUT based on editing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `http://localhost:5000/api/news/${editingId}`
        : 'http://localhost:5000/api/news';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save news');

      fetchNews();
      setFormData(initialFormState);
      setEditingId(null);
      setIsFormExpanded(false);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (news: News) => {
    setEditingId(news.id);
    setFormData({
      title: news.title,
      content: news.content,
      imageUrl: news.imageUrl || '',
      date: news.date.slice(0, 10), // YYYY-MM-DD for date input
    });
    setIsFormExpanded(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/news/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');

      fetchNews();
    } catch {
      alert('Error during deletion');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 40, color: '#333' }}>Loading news...</p>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ 
        color: '#333',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px',
        marginBottom: '30px'
      }}>
        News Management
      </h1>

      {/* Compact Form */}
      <div style={{
        marginBottom: '40px',
        padding: isFormExpanded ? '25px' : '15px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}>
        {!isFormExpanded && !editingId ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#333' }}>Add New News</h3>
            <button
              onClick={() => setIsFormExpanded(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4a6baf',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Expand Form
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                color: '#333',
                margin: 0,
                fontSize: '1.3rem'
              }}>
                {editingId ? 'Edit News' : 'Add New News'}
              </h2>
              <button
                onClick={() => {
                  setIsFormExpanded(false);
                  setEditingId(null);
                  setFormData(initialFormState);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  backgroundColor: 'transparent',
                  color: '#555',
                  cursor: 'pointer',
                }}
              >
                Minimize
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  name="title"
                  placeholder="News title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <textarea
                  name="content"
                  placeholder="News content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <input
                    type="url"
                    name="imageUrl"
                    placeholder="Image URL"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '15px',
                    }}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '15px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#4a6baf',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  {editingId ? 'Update News' : 'Create News'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData(initialFormState);
                    setIsFormExpanded(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    color: '#555',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Cancel
                </button>
              </div>

              {error && (
                <p style={{ 
                  color: '#e74c3c', 
                  marginTop: '10px', 
                  textAlign: 'center',
                  padding: '8px',
                  backgroundColor: '#fdecea',
                  borderRadius: '4px'
                }}>
                  {error}
                </p>
              )}
            </form>
          </>
        )}
      </div>

      {/* News List */}
      <div>
        <h2 style={{ 
          color: '#333',
          marginBottom: '20px',
          fontSize: '1.3rem'
        }}>
          News List
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {newsList.map(n => (
            <div
              key={n.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <img
                  src={n.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={n.title}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '12px',
                  }}
                />
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: '#333',
                  fontSize: '1.1rem'
                }}>
                  {n.title}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#777',
                    marginBottom: '12px',
                  }}
                >
                  {new Date(n.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#555',
                  lineHeight: '1.5',
                  marginBottom: '15px'
                }}>
                  {n.content.length > 100 ? `${n.content.substring(0, 100)}...` : n.content}
                </p>
              </div>

              <div style={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEdit(n)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#4a6baf',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;