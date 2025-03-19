"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ServiceForm from '@/components/forms/ServiceForm';
import { toast } from 'sonner';

export default function AddServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create service');
      }
      
      toast.success('Service created successfully');
      
      // Navigate back to the services list page after successful creation
      router.push('/services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error(error.message || 'Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Add New Service</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Create a new service to monitor its health and performance.
        </p>
      </div>

      <ServiceForm onSubmit={handleSubmit} />
    </div>
  );
}