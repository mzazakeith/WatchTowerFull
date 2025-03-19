import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function CheckServiceButton({ serviceId, onCheckComplete }) {
  const [isChecking, setIsChecking] = useState(false);

  async function triggerServiceCheck() {
    try {
      setIsChecking(true);
      
      const response = await fetch('/api/services/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check service');
      }
      
      const data = await response.json();
      
      toast.success(`Service check completed: ${data.status}`);
      
      // Call the callback if provided
      if (onCheckComplete) {
        onCheckComplete(data.check);
      }
    } catch (error) {
      console.error('Error checking service:', error);
      toast.error(error.message || 'Failed to check service');
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <Button 
      onClick={triggerServiceCheck} 
      disabled={isChecking}
      variant="outline"
    >
      <ArrowPathIcon className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
      Run Check
    </Button>
  );
}