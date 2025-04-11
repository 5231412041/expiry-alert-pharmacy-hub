
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BellRing, AlertTriangle, CheckCircle, Mail, MessageSquare, Loader2, Settings } from 'lucide-react';
import { getMedicineSummary } from '../../services/medicineService';
import { processPendingNotifications } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

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
  
  // Load medicine summary on component mount
  useEffect(() => {
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
    
    loadSummary();
  }, []);
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BellRing className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      
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
                    <Card className="p-4 bg-orange-50 border-pharmacy-orange">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-pharmacy-orange mr-2" />
                          <h3 className="text-sm font-medium">Expiring Soon</h3>
                        </div>
                        <span className="text-lg font-semibold">{medicineStats.expiringSoon}</span>
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-red-50 border-pharmacy-red">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-pharmacy-red mr-2" />
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
                        <CheckCircle className="h-12 w-12 mx-auto text-pharmacy-green mb-4" />
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
    </div>
  );
};

export default Notifications;
