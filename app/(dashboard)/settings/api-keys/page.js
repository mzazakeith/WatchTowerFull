"use client";

import { useState, useEffect } from 'react';
import { 
  KeyIcon, 
  ClipboardIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  PlusIcon, 
  TrashIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [showNewKeyValue, setShowNewKeyValue] = useState(true);
  const [selectedKeyToDelete, setSelectedKeyToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [isDeletingKey, setIsDeletingKey] = useState(false);

  // Fetch API keys on component mount
  useEffect(() => {
    async function fetchApiKeys() {
      try {
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for API keys
        const mockApiKeys = [
          {
            id: 'key_1',
            name: 'Production Monitoring',
            prefix: 'wt_prod_',
            lastUsed: '2023-03-17T15:40:00Z',
            createdAt: '2022-12-10T09:15:00Z',
            expiresAt: '2024-12-10T09:15:00Z'
          },
          {
            id: 'key_2',
            name: 'Staging Environment',
            prefix: 'wt_stag_',
            lastUsed: '2023-03-15T11:20:00Z',
            createdAt: '2023-01-05T14:30:00Z',
            expiresAt: '2025-01-05T14:30:00Z'
          },
          {
            id: 'key_3',
            name: 'Development Testing',
            prefix: 'wt_dev_',
            lastUsed: null,
            createdAt: '2023-02-20T10:45:00Z',
            expiresAt: '2025-02-20T10:45:00Z'
          }
        ];
        
        setApiKeys(mockApiKeys);
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast.error('Failed to load API keys');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchApiKeys();
  }, []);

  // Handle copy key to clipboard
  const handleCopyKey = (value) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        toast.success('API key copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy API key:', error);
        toast.error('Failed to copy to clipboard');
      });
  };

  // Handle create new API key
  const handleCreateKey = async (e) => {
    e.preventDefault();
    
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }
    
    try {
      setIsCreatingKey(true);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response for a new API key
      const keyPrefix = 'wt_' + Math.random().toString(36).substring(2, 6) + '_';
      const keyValue = keyPrefix + Array(32).fill(0).map(() => Math.random().toString(36).charAt(2)).join('');
      
      const newKey = {
        id: 'key_' + Date.now(),
        name: newKeyName,
        prefix: keyPrefix,
        value: keyValue, // This would never be returned from a real API
        lastUsed: null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 63072000000).toISOString() // 2 years in the future
      };
      
      // Update local state
      setApiKeys(prev => [...prev, {
        id: newKey.id,
        name: newKey.name,
        prefix: newKey.prefix,
        lastUsed: newKey.lastUsed,
        createdAt: newKey.createdAt,
        expiresAt: newKey.expiresAt
      }]);
      
      // Save the newly created key (with actual value) to show to the user
      setNewlyCreatedKey(newKey);
      setNewKeyName('');
      
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreatingKey(false);
      setShowCreateDialog(false);
    }
  };

  // Handle delete API key
  const handleDeleteKey = async () => {
    if (!selectedKeyToDelete) return;
    
    try {
      setIsDeletingKey(true);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setApiKeys(prev => prev.filter(key => key.id !== selectedKeyToDelete.id));
      
      toast.success(`API key "${selectedKeyToDelete.name}" revoked successfully`);
      setSelectedKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to revoke API key');
    } finally {
      setIsDeletingKey(false);
      setShowDeleteDialog(false);
    }
  };

  // Calculate days remaining before expiry
  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">API Keys</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage API keys for integrating with the WatchTower platform
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* API Keys Information */}
      <Card>
        <CardHeader>
          <CardTitle>Using API Keys</CardTitle>
          <CardDescription>
            API keys allow secure access to the WatchTower API from external applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Security Best Practices</h3>
                <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 list-disc pl-5">
                  <li>Never share your API keys in publicly accessible areas such as GitHub or client-side code.</li>
                  <li>Each application should have its own API key. If a key is compromised, you can revoke it without affecting other applications.</li>
                  <li>Regularly rotate your API keys to minimize damage from undetected compromised keys.</li>
                  <li>API keys will expire after 2 years and need to be rotated.</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CodeBracketIcon className="h-5 w-5 text-neutral-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Example API Request</h3>
                <div className="bg-neutral-900 text-neutral-100 p-3 rounded-lg overflow-x-auto text-sm font-mono mt-2">
                  <pre>{`curl -X GET \\
  https://api.watchtower.com/v1/services \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage and monitor your existing API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <KeyIcon className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys Found</h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                You haven&apos;t created any API keys yet. API keys allow secure access to the WatchTower API.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => {
                const daysRemaining = getDaysRemaining(key.expiresAt);
                const isExpiringSoon = daysRemaining <= 30;
                
                return (
                  <div 
                    key={key.id} 
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{key.name}</h3>
                        {isExpiringSoon && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                            Expires Soon
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <span>
                          <span className="font-mono">{key.prefix}</span>••••••••••••••••
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleCopyKey(`${key.prefix}XXXXXXXXXXXXXXXXXXXX`)}
                        >
                          <ClipboardIcon className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy API key</span>
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
                        <span className="flex items-center">
                          <ClockIcon className="h-3.5 w-3.5 mr-1" />
                          Created: {formatDate(key.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-3.5 w-3.5 mr-1" />
                          Expires: {formatDate(key.expiresAt)} ({daysRemaining} days)
                        </span>
                        {key.lastUsed && (
                          <span className="flex items-center">
                            <ClockIcon className="h-3.5 w-3.5 mr-1" />
                            Last used: {formatDate(key.lastUsed)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      onClick={() => {
                        setSelectedKeyToDelete(key);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Revoke
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to securely access the WatchTower API
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateKey}>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input 
                  id="keyName" 
                  placeholder="e.g. Production Monitoring" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Choose a descriptive name to help you identify this key in the future.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingKey}>
                {isCreatingKey ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : 'Create API Key'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Newly Created Key Dialog */}
      <Dialog open={newlyCreatedKey !== null} onOpenChange={(open) => !open && setNewlyCreatedKey(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Make sure to copy your API key now. You won&apos;t be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  This API key will only be displayed once. If you lose it, you&apos;ll need to create a new one.
                </p>
              </div>
              
              <div>
                <Label>API Key Name</Label>
                <p className="font-medium mt-1">{newlyCreatedKey?.name}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>API Key</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowNewKeyValue(prev => !prev)}
                    className="h-7 px-2"
                  >
                    {showNewKeyValue ? (
                      <EyeSlashIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <EyeIcon className="h-4 w-4 mr-1" />
                    )}
                    {showNewKeyValue ? 'Hide' : 'Show'}
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    value={showNewKeyValue ? newlyCreatedKey?.value : '•'.repeat(newlyCreatedKey?.value?.length || 30)}
                    readOnly
                    className="font-mono pr-10"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => handleCopyKey(newlyCreatedKey?.value)}
                  >
                    <ClipboardIcon className="h-4 w-4" />
                    <span className="sr-only">Copy API key</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewlyCreatedKey(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">Warning: Destructive Action</p>
                <p className="text-sm">
                  Revoking &quot;{selectedKeyToDelete?.name}&quot; will immediately invalidate the key.
                  Any applications using this key will no longer be able to access the API.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteKey} 
              disabled={isDeletingKey}
            >
              {isDeletingKey ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : 'Revoke API Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 