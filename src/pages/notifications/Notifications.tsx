
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  BellRing, AlertTriangle, CheckCircle, Mail, MessageSquare, 
  Loader2, Settings, UserPlus, Users, Trash2, Edit, Check 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMedicineSummary } from '../../services/medicineService';
import { 
  processPendingNotifications, 
  getAllRecipients, 
  addRecipient, 
  removeRecipient, 
  updateRecipient,
  scheduleAutomatedNotifications
} from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  receiveEmail: boolean;
  receiveWhatsapp: boolean;
}

const Notifications = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [medicineStats, setMedicineStats] = useState({
    expiringSoon: 0,
    expired: 0
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    receiveEmail: true,
    receiveWhatsapp: false
  });
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [automationInterval, setAutomationInterval] = useState('daily');
  const [automationTime, setAutomationTime] = useState('09:00');
  
  // Load medicine summary and recipients on component mount
  useEffect(() => {
    loadSummary();
    if (user?.role === 'admin') {
      loadRecipients();
    }
    // Check if automation is enabled from localStorage
    const savedAutomation = localStorage.getItem('automationEnabled');
    if (savedAutomation) {
      setAutomationEnabled(savedAutomation === 'true');
    }
    const savedInterval = localStorage.getItem('automationInterval');
    if (savedInterval) {
      setAutomationInterval(savedInterval);
    }
    const savedTime = localStorage.getItem('automationTime');
    if (savedTime) {
      setAutomationTime(savedTime);
    }
  }, [user]);
  
  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const summary = await getMedicineSummary();
      setMedicineStats({
        expiringSoon: summary.expiringSoon,
        expired: summary.expired
      });
      setSummaryLoaded(true);
    } catch (error) {
      console.error('Error loading medicine summary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load medicine summary"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadRecipients = async () => {
    if (user?.role !== 'admin') return;
    
    try {
      const data = await getAllRecipients();
      setRecipients(data);
    } catch (error) {
      console.error('Error loading recipients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification recipients"
      });
    }
  };
  
  const handleSendNotifications = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Process notifications
      await processPendingNotifications(user.email, phoneNumber);
      
      toast({
        title: "Success",
        description: "Notifications have been sent successfully"
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notifications"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification settings have been updated"
    });
  };
  
  const handleAddRecipient = async () => {
    if (!user || user.role !== 'admin') return;
    
    setIsAddingRecipient(true);
    try {
      const recipient = await addRecipient({
        ...newRecipient,
        id: '',
      });
      
      setRecipients([...recipients, recipient]);
      setNewRecipient({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        receiveEmail: true,
        receiveWhatsapp: false
      });
      
      toast({
        title: "Recipient Added",
        description: `${recipient.name} has been added to the notification list`
      });
    } catch (error) {
      console.error('Error adding recipient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add recipient"
      });
    } finally {
      setIsAddingRecipient(false);
    }
  };
  
  const handleRemoveRecipient = async (id: string) => {
    if (!user || user.role !== 'admin') return;
    
    try {
      await removeRecipient(id);
      setRecipients(recipients.filter(r => r.id !== id));
      
      toast({
        title: "Recipient Removed",
        description: "The recipient has been removed from the notification list"
      });
    } catch (error) {
      console.error('Error removing recipient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove recipient"
      });
    }
  };
  
  const handleStartEditing = (recipient: Recipient) => {
    setEditingRecipient(recipient);
  };
  
  const handleUpdateRecipient = async () => {
    if (!editingRecipient || !user || user.role !== 'admin') return;
    
    try {
      await updateRecipient(editingRecipient);
      setRecipients(recipients.map(r => r.id === editingRecipient.id ? editingRecipient : r));
      setEditingRecipient(null);
      
      toast({
        title: "Recipient Updated",
        description: `${editingRecipient.name}'s information has been updated`
      });
    } catch (error) {
      console.error('Error updating recipient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update recipient"
      });
    }
  };
  
  const handleAutomationToggle = async (enabled: boolean) => {
    setAutomationEnabled(enabled);
    localStorage.setItem('automationEnabled', enabled.toString());
    
    if (enabled) {
      try {
        await scheduleAutomatedNotifications(automationInterval, automationTime);
        toast({
          title: "Automation Enabled",
          description: `Notifications will be sent ${automationInterval} at ${automationTime}`
        });
      } catch (error) {
        console.error('Error enabling automation:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to enable automated notifications"
        });
      }
    } else {
      toast({
        title: "Automation Disabled",
        description: "Automated notifications have been turned off"
      });
    }
  };
  
  const handleIntervalChange = (interval: string) => {
    setAutomationInterval(interval);
    localStorage.setItem('automationInterval', interval);
    
    if (automationEnabled) {
      scheduleAutomatedNotifications(interval, automationTime);
    }
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutomationTime(e.target.value);
    localStorage.setItem('automationTime', e.target.value);
    
    if (automationEnabled) {
      scheduleAutomatedNotifications(automationInterval, e.target.value);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BellRing className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="send">Send Notifications</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          {user?.role === 'admin' && (
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="send">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Send Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading medicine stats...</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-orange-50 border-orange-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                              <h3 className="text-sm font-medium">Expiring Soon</h3>
                            </div>
                            <span className="text-lg font-semibold">{medicineStats.expiringSoon}</span>
                          </div>
                        </Card>
                        
                        <Card className="p-4 bg-red-50 border-red-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                              <h3 className="text-sm font-medium">Expired</h3>
                            </div>
                            <span className="text-lg font-semibold">{medicineStats.expired}</span>
                          </div>
                        </Card>
                      </div>
                      
                      {(medicineStats.expiringSoon > 0 || medicineStats.expired > 0) ? (
                        <div className="space-y-2">
                          <p className="text-sm">
                            Send notifications about expiring and expired medicines to concerned staff members.
                          </p>
                          
                          {whatsappNotifications && (
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber">WhatsApp Recipient Number</Label>
                              <Input 
                                id="phoneNumber" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1234567890"
                              />
                              <p className="text-xs text-gray-500">
                                Enter the phone number with country code to receive WhatsApp notifications
                              </p>
                            </div>
                          )}
                          
                          <Button 
                            onClick={handleSendNotifications}
                            disabled={isProcessing}
                            className="w-full mt-2"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending notifications...
                              </>
                            ) : (
                              <>
                                <BellRing className="mr-2 h-4 w-4" />
                                Send Notifications
                              </>
                            )}
                          </Button>
                        </div>
                      ) : summaryLoaded ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-medium">All good!</h3>
                            <p className="text-gray-500 mt-1">
                              No medicines are expiring soon or expired. No notifications needed.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                          <span className="ml-2">Failed to load medicine data</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 pl-6">
                    Receive notifications via email
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <Label htmlFor="whatsapp-notifications">WhatsApp Notifications</Label>
                    </div>
                    <Switch
                      id="whatsapp-notifications"
                      checked={whatsappNotifications}
                      onCheckedChange={setWhatsappNotifications}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 pl-6">
                    Receive notifications via WhatsApp
                  </p>
                </div>
                
                <Button onClick={handleSaveSettings} className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automated Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Automated Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      System will automatically send notifications based on your schedule
                    </p>
                  </div>
                  <Switch
                    checked={automationEnabled}
                    onCheckedChange={handleAutomationToggle}
                  />
                </div>
                
                {automationEnabled && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Schedule Frequency</Label>
                      <div className="flex gap-2">
                        <Button 
                          variant={automationInterval === 'daily' ? 'default' : 'outline'}
                          onClick={() => handleIntervalChange('daily')}
                          className="flex-1"
                        >
                          Daily
                        </Button>
                        <Button 
                          variant={automationInterval === 'weekly' ? 'default' : 'outline'}
                          onClick={() => handleIntervalChange('weekly')}
                          className="flex-1"
                        >
                          Weekly
                        </Button>
                        <Button 
                          variant={automationInterval === 'monthly' ? 'default' : 'outline'}
                          onClick={() => handleIntervalChange('monthly')}
                          className="flex-1"
                        >
                          Monthly
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notification-time">Time of Day</Label>
                      <Input
                        id="notification-time"
                        type="time"
                        value={automationTime}
                        onChange={handleTimeChange}
                      />
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Notifications will be sent {automationInterval} at {automationTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {user?.role === 'admin' && (
          <TabsContent value="recipients">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle>Notification Recipients</CardTitle>
                <Button size="sm" variant="outline" onClick={() => loadRecipients()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-center">Email</TableHead>
                          <TableHead className="text-center">WhatsApp</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No recipients found. Add your first one below.
                            </TableCell>
                          </TableRow>
                        ) : (
                          recipients.map((recipient) => (
                            <TableRow key={recipient.id}>
                              <TableCell>
                                {editingRecipient?.id === recipient.id ? (
                                  <Input
                                    value={editingRecipient.name}
                                    onChange={(e) => setEditingRecipient({...editingRecipient, name: e.target.value})}
                                  />
                                ) : (
                                  recipient.name
                                )}
                              </TableCell>
                              <TableCell>
                                {editingRecipient?.id === recipient.id ? (
                                  <Input
                                    value={editingRecipient.email}
                                    onChange={(e) => setEditingRecipient({...editingRecipient, email: e.target.value})}
                                  />
                                ) : (
                                  recipient.email
                                )}
                              </TableCell>
                              <TableCell>
                                {editingRecipient?.id === recipient.id ? (
                                  <Input
                                    value={editingRecipient.phone || ''}
                                    onChange={(e) => setEditingRecipient({...editingRecipient, phone: e.target.value})}
                                  />
                                ) : (
                                  recipient.phone || '-'
                                )}
                              </TableCell>
                              <TableCell>
                                {editingRecipient?.id === recipient.id ? (
                                  <select
                                    className="w-full p-2 border rounded"
                                    value={editingRecipient.role}
                                    onChange={(e) => setEditingRecipient({...editingRecipient, role: e.target.value})}
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                  </select>
                                ) : (
                                  recipient.role
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {editingRecipient?.id === recipient.id ? (
                                  <Switch
                                    checked={editingRecipient.receiveEmail}
                                    onCheckedChange={(checked) => setEditingRecipient({...editingRecipient, receiveEmail: checked})}
                                  />
                                ) : (
                                  recipient.receiveEmail ? 'Yes' : 'No'
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {editingRecipient?.id === recipient.id ? (
                                  <Switch
                                    checked={editingRecipient.receiveWhatsapp}
                                    onCheckedChange={(checked) => setEditingRecipient({...editingRecipient, receiveWhatsapp: checked})}
                                  />
                                ) : (
                                  recipient.receiveWhatsapp ? 'Yes' : 'No'
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {editingRecipient?.id === recipient.id ? (
                                  <Button 
                                    size="sm" 
                                    onClick={handleUpdateRecipient}
                                    className="ml-2"
                                  >
                                    <Check className="h-4 w-4" />
                                    Save
                                  </Button>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleStartEditing(recipient)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleRemoveRecipient(recipient.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Recipient</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="recipient-name">Name</Label>
                            <Input 
                              id="recipient-name"
                              value={newRecipient.name}
                              onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient-email">Email</Label>
                            <Input 
                              id="recipient-email"
                              type="email"
                              value={newRecipient.email}
                              onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="recipient-phone">Phone (for WhatsApp)</Label>
                            <Input 
                              id="recipient-phone"
                              value={newRecipient.phone}
                              onChange={(e) => setNewRecipient({...newRecipient, phone: e.target.value})}
                              placeholder="+1234567890"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipient-role">Role</Label>
                            <select
                              id="recipient-role"
                              className="w-full p-2 border rounded"
                              value={newRecipient.role}
                              onChange={(e) => setNewRecipient({...newRecipient, role: e.target.value})}
                            >
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="receive-email"
                              checked={newRecipient.receiveEmail}
                              onCheckedChange={(checked) => setNewRecipient({...newRecipient, receiveEmail: checked})}
                            />
                            <Label htmlFor="receive-email">Receive Email Notifications</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="receive-whatsapp"
                              checked={newRecipient.receiveWhatsapp}
                              onCheckedChange={(checked) => setNewRecipient({...newRecipient, receiveWhatsapp: checked})}
                            />
                            <Label htmlFor="receive-whatsapp">Receive WhatsApp Notifications</Label>
                          </div>
                        </div>
                        <Button 
                          onClick={handleAddRecipient} 
                          disabled={isAddingRecipient || !newRecipient.name || !newRecipient.email}
                          className="mt-2"
                        >
                          {isAddingRecipient ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding Recipient...
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add Recipient
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Notifications;
