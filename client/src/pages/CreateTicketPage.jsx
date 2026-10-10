/**
 * CreateTicketPage - Redesigned
 * Form for creating new support tickets
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';

export const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headerStyles = {
    marginBottom: 'var(--spacing-6)',
  };

  const titleStyles = {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: 'var(--color-gray-900)',
    marginBottom: 'var(--spacing-2)',
  };

  const subtitleStyles = {
    fontSize: '1rem',
    color: 'var(--color-gray-600)',
  };

  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  };

  const formActionsStyles = {
    display: 'flex',
    gap: 'var(--spacing-3)',
    justifyContent: 'flex-end',
    paddingTop: 'var(--spacing-4)',
    borderTop: '1px solid var(--color-gray-200)',
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: null }));
    setError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (formData.title.trim().length > 200) {
      errors.title = 'Title must not exceed 200 characters';
    }

    if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (formData.description.trim().length > 5000) {
      errors.description = 'Description must not exceed 5000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const newTicket = await ticketAPI.createTicket(
        formData.title.trim(),
        formData.description.trim(),
        formData.priority
      );
      navigate(`/tickets/${newTicket._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={containerStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>Create New Ticket</h1>
          <p style={subtitleStyles}>
            Describe your issue and we'll get back to you as soon as possible
          </p>
        </div>

        <Card>
          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={formStyles}>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              label="Ticket Title"
              placeholder="Brief summary of your issue"
              required
              error={validationErrors.title}
              helperText="A clear, concise title helps us route your ticket faster"
            />

            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              label="Description"
              placeholder="Provide detailed information about your issue..."
              required
              rows={8}
              error={validationErrors.description}
            />

            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={priorityOptions}
              label="Priority"
              required
            />

            <div style={formActionsStyles}>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
              >
                Create Ticket
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};
