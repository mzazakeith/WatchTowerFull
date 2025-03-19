'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CreateIncidentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'minor',
    status: 'investigating',
    services: [],
    notify: true
  });

  // Fetch services for dropdown
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      }
    }
    
    fetchServices();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, notify: checked }));
  };

  // Handle service selection
  const handleServiceChange = (serviceId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(id => id !== serviceId)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please provide an incident title');
      return;
    }
    
    if (formData.services.length === 0) {
      toast.error('Please select at least one affected service');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create incident');
      }
      
      const data = await response.json();
      
      toast.success('Incident created successfully');
      router.push(`/incidents/${data.incident._id}`);
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error(error.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/incidents" className="text-primary hover:underline inline-flex items-center gap-1">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Incidents
        </Link>
        <h1 className="text-3xl font-bold mt-4">Create New Incident</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Document a service disruption and notify stakeholders
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
                <CardDescription>
                  Provide information about the ongoing issue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. API Gateway Performance Degradation"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the incident in detail..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <RadioGroup
                      defaultValue={formData.severity}
                      onValueChange={(value) => handleSelectChange('severity', value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minor" id="severity-minor" />
                        <Label htmlFor="severity-minor">Minor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="major" id="severity-major" />
                        <Label htmlFor="severity-major">Major</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="critical" id="severity-critical" />
                        <Label htmlFor="severity-critical">Critical</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Initial Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="identified">Identified</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Affected Services</Label>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    {services.length > 0 ? (
                      <div className="space-y-2">
                        {services.map(service => (
                          <div key={service._id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`service-${service._id}`}
                              checked={formData.services.includes(service._id)}
                              onCheckedChange={(checked) => handleServiceChange(service._id, checked)}
                            />
                            <Label htmlFor={`service-${service._id}`} className="flex items-center gap-2">
                              {service.name} 
                              <span className="text-xs text-neutral-500">({service.url})</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-neutral-500">
                        <p>No services available</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify" 
                    checked={formData.notify}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="notify">Notify team members</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Link href="/incidents">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      Create Incident
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1.5">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">Recording</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    The incident will be recorded with a timeline of events.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-1 bg-amber-100 dark:bg-amber-900/30 rounded-full p-1.5">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Team members will be notified based on notification preferences.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="mt-1 bg-green-100 dark:bg-green-900/30 rounded-full p-1.5">
                  <CheckCircleIcon className="h-5 w-5 text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium">Resolution</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    You can update the incident status as you work towards resolving it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 