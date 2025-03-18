"use client";

import { useRouter } from 'next/navigation';
import ServiceForm from '@/components/forms/ServiceForm';

export default function AddServicePage() {
  const router = useRouter();

  // This will be replaced with real API calls in production
  const handleSubmit = (data) => {
    // Navigate back to the services list page after successful creation
    router.push('/services');
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