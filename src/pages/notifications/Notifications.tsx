import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Clock, Mail, AlertTriangle, User, Users, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getDB } from "../../services/db";
import { Notification, Recipient } from "../../types/models";
import { useAuth } from "../../contexts/AuthContext";
import { processPendingNotifications } from "../../services/notificationService";

const NotificationsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(30);
  const [refreshTime, setRefreshTime] = useState("08:00");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    receiveEmail: true,
    receiveWhatsapp: false
  });
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = await getDB();
        const storedNotifications = await db.getAll('notifications');
        const storedRecipients = await db.getAll('recipients');
        
        setNotifications(storedNotifications);
        setRecipients(storedRecipients);
        
        const settingsStore = db.transaction('recipients', 'readonly')
          .objectStore('recipients');
        
        const settingsCursor = await settingsStore.openCursor();
        if (settingsCursor) {
          setEmailEnabled(true);
          setWhatsappEnabled(true);
          setDaysBeforeExpiry(30);
          setRefreshTime("08:00");
        }
      } catch (error) {
        console.error("Error fetching notification data:", error);
        toast({
          title: "Error",
          description: "Could not load notification data",
          variant: "destructive"
        });
      }
    };
    
    fetchData();
  }, [toast]);

  const handleSaveSettings = async () => {
    try {
      const schedule = { interval: 'daily', time: refreshTime, daysBeforeExpiry };
      localStorage.setItem('notificationSchedule', JSON.stringify(schedule));
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Could not save notification settings",
        variant: "destructive"
      });
    }
  };

  const handleRunCheckNow = async () => {
    try {
      toast({
        title: "Processing notifications",
        description: "Checking for expiring medicines...",
      });
      
      await processPendingNotifications();
      
      const db = await getDB();
      const storedNotifications = await db.getAll('notifications');
      setNotifications(storedNotifications);
      
      toast({
        title: "Check complete",
        description: "Notification check has been completed successfully",
      });
    } catch (error) {
      console.error("Error running notification check:", error);
      toast({
        title: "Error",
        description: "Could not run notification check",
        variant: "destructive"
      });
    }
  };

  const handleAddRecipient = async () => {
    try {
      const db = await getDB();
      
      const newId = `recipient-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const recipientToAdd = {
        ...newRecipient,
        id: newId,
      };
      
      await db.add('recipients', recipientToAdd);
      
      setRecipients([...recipients, recipientToAdd]);
      
      setNewRecipient({
        name: '',
        email: '',
        phone: '',
        role: 'staff',
        receiveEmail: true,
        receiveWhatsapp: false
      });
      setIsAddDialogOpen(false);
      
      toast({
        title: "Recipient added",
        description: "New notification recipient has been added"
      });
    } catch (error) {
      console.error("Error adding recipient:", error);
      toast({
        title: "Error",
        description: "Could not add new recipient",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this recipient?")) {
      try {
        const db = await getDB();
        await db.delete('recipients', id);
        
        setRecipients(recipients.filter(recipient => recipient.id !== id));
        
        toast({
          title: "Recipient deleted",
          description: "The notification recipient has been removed"
        });
      } catch (error) {
        console.error("Error deleting recipient:", error);
        toast({
          title: "Error",
          description: "Could not delete recipient",
          variant: "destructive"
        });
      }
    }
  };

  const openEditDialog = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRecipient = async () => {
    if (!editingRecipient) return;
    
    try {
      const db = await getDB();
      await db.put('recipients', editingRecipient);
      
      setRecipients(recipients.map(r => 
        r.id === editingRecipient.id ? editingRecipient : r
      ));
      
      setIsEditDialogOpen(false);
      setEditingRecipient(null);
      
      toast({
        title: "Recipient updated",
        description: "The notification recipient has been updated"
      });
    } catch (error) {
      console.error("Error updating recipient:", error);
      toast({
        title: "Error",
        description: "Could not update recipient",
        variant: "destructive"
      });
    }
  };

  const renderNotificationHistory = () => {
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Bell className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No notifications yet</h3>
          <p className="text-gray-400 text-center mt-1">
            Notifications will appear here once they are sent
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableCaption>List of recent notifications</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification) => (
            <TableRow key={notification.id}>
              <TableCell>{new Date(notification.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {notification.type === 'email' ? (
                  <Mail className="h-4 w-4 inline mr-1" />
                ) : (
                  <Bell className="h-4 w-4 inline mr-1" />
                )}
                {notification.type}
              </TableCell>
              <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  notification.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {notification.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderRecipientsList = () => {
    if (recipients.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Users className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No recipients added</h3>
          <p className="text-gray-400 text-center mt-1">
            Add recipients to get started with notifications
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableCaption>List of notification recipients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Methods</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipients.map((recipient) => (
            <TableRow key={recipient.id}>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  {recipient.name}
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  recipient.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {recipient.role}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{recipient.email}</div>
                  {recipient.phone && <div className="text-gray-500">{recipient.phone}</div>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {recipient.receiveEmail && (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Email
                    </span>
                  )}
                  {recipient.receiveWhatsapp && (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      WhatsApp
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openEditDialog(recipient)}
                  >
                    <span className="sr-only">Edit</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteRecipient(recipient.id)}
                  >
                    <span className="sr-only">Delete</span>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const runCheckNowButton = (
    <div className="pt-2">
      <Button className="w-full" variant="outline" onClick={handleRunCheckNow}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Run check now
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Configure and manage notifications for expiring medicines
          </p>
        </div>
        <Button onClick={() => handleSaveSettings()}>
          Save Settings
        </Button>
      </div>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Methods</CardTitle>
              <CardDescription>Choose how you want to be notified about expiring medicines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive emails about medicines that will expire soon
                  </div>
                </div>
                <Switch 
                  checked={emailEnabled} 
                  onCheckedChange={setEmailEnabled} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>WhatsApp Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive WhatsApp messages about medicines that will expire soon
                  </div>
                </div>
                <Switch 
                  checked={whatsappEnabled} 
                  onCheckedChange={setWhatsappEnabled} 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notification Timing</CardTitle>
              <CardDescription>Configure when notifications should be sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="days-before">Days before expiry</Label>
                <Input 
                  id="days-before" 
                  type="number" 
                  value={daysBeforeExpiry}
                  onChange={(e) => setDaysBeforeExpiry(Number(e.target.value))}
                  min="1"
                  max="90"
                />
                <p className="text-sm text-muted-foreground">
                  You will be notified when medicines are within this many days of expiry
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="refresh-time">Daily check time</Label>
                <Input 
                  id="refresh-time" 
                  type="time" 
                  value={refreshTime}
                  onChange={(e) => setRefreshTime(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The system will check for expiring medicines at this time each day
                </p>
              </div>
              
              {runCheckNowButton}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>Recent notifications sent about expiring medicines</CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {renderNotificationHistory()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recipients">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notification Recipients</CardTitle>
                <CardDescription>
                  Manage who receives notifications about expiring medicines
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add Recipient</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Recipient</DialogTitle>
                    <DialogDescription>
                      Add a new person to receive medicine expiry notifications
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input 
                        id="name" 
                        className="col-span-3" 
                        value={newRecipient.name}
                        onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        className="col-span-3" 
                        value={newRecipient.email}
                        onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        className="col-span-3" 
                        placeholder="Optional"
                        value={newRecipient.phone}
                        onChange={(e) => setNewRecipient({...newRecipient, phone: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Role</Label>
                      <select
                        id="role"
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newRecipient.role}
                        onChange={(e) => setNewRecipient({...newRecipient, role: e.target.value})}
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email-notif" className="text-right">Email Notifications</Label>
                      <div className="col-span-3">
                        <Switch 
                          id="email-notif"
                          checked={newRecipient.receiveEmail}
                          onCheckedChange={(checked) => setNewRecipient({...newRecipient, receiveEmail: checked})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="whatsapp-notif" className="text-right">WhatsApp Notifications</Label>
                      <div className="col-span-3">
                        <Switch 
                          id="whatsapp-notif"
                          checked={newRecipient.receiveWhatsapp}
                          onCheckedChange={(checked) => setNewRecipient({...newRecipient, receiveWhatsapp: checked})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddRecipient}>Add Recipient</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Recipient</DialogTitle>
                    <DialogDescription>
                      Update recipient's information
                    </DialogDescription>
                  </DialogHeader>
                  
                  {editingRecipient && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                        <Input 
                          id="edit-name" 
                          className="col-span-3" 
                          value={editingRecipient.name}
                          onChange={(e) => setEditingRecipient({...editingRecipient, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email" className="text-right">Email</Label>
                        <Input 
                          id="edit-email" 
                          type="email" 
                          className="col-span-3" 
                          value={editingRecipient.email}
                          onChange={(e) => setEditingRecipient({...editingRecipient, email: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                        <Input 
                          id="edit-phone" 
                          type="tel" 
                          className="col-span-3" 
                          value={editingRecipient.phone || ""}
                          onChange={(e) => setEditingRecipient({...editingRecipient, phone: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-role" className="text-right">Role</Label>
                        <select
                          id="edit-role"
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={editingRecipient.role}
                          onChange={(e) => setEditingRecipient({...editingRecipient, role: e.target.value})}
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email-notif" className="text-right">Email Notifications</Label>
                        <div className="col-span-3">
                          <Switch 
                            id="edit-email-notif"
                            checked={editingRecipient.receiveEmail}
                            onCheckedChange={(checked) => setEditingRecipient({...editingRecipient, receiveEmail: checked})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-whatsapp-notif" className="text-right">WhatsApp Notifications</Label>
                        <div className="col-span-3">
                          <Switch 
                            id="edit-whatsapp-notif"
                            checked={editingRecipient.receiveWhatsapp}
                            onCheckedChange={(checked) => setEditingRecipient({...editingRecipient, receiveWhatsapp: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingRecipient(null);
                    }}>Cancel</Button>
                    <Button onClick={handleUpdateRecipient}>Update Recipient</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {renderRecipientsList()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
