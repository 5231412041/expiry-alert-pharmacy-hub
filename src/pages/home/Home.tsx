
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Bell, CalendarClock, FileSpreadsheet, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleNavigation = (path: string) => {
    // Redirect to login if not authenticated, otherwise go to app route
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/app/${path}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center space-y-2 max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight">PharmTrack - Pharmacy Expiry Date Tracker</h1>
        <p className="text-muted-foreground">
          A comprehensive solution to help pharmacies track, manage, and get notified about medicines
          based on their expiry dates, ensuring safe medicine usage and reducing wastage.
        </p>
        
        {!user && (
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => navigate('/login')} variant="default">
              Login
            </Button>
            <Button onClick={() => navigate('/register')} variant="outline">
              Register
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicine Management</CardTitle>
            <Pill className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, view, and categorize medicines by their expiry status. Track safe, soon-to-expire, and expired medicines.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => handleNavigation('medicines')}>
              Manage Medicines
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive alerts via email and WhatsApp when medicines are nearing expiry or have expired.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => handleNavigation('notifications')}>
              Configure Notifications
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSV Upload</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload medicines in bulk using .csv files. Each row is parsed, validated, and stored in the database.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => handleNavigation('csv-upload')}>
              Import Medicines
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics Dashboard</CardTitle>
            <CalendarClock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visual dashboard with graphs showing the number of expired, soon-to-expire, and safe medicines.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => handleNavigation('dashboard')}>
              View Dashboard
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Management</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track medicine stock levels, manage inventory, and generate stock reports.
            </p>
            <Button variant="outline" className="w-full mt-4" onClick={() => handleNavigation('inventory')}>
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Status Check</CardTitle>
            <div className="flex space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={() => handleNavigation('safe-medicines')}>
              Safe Medicines
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleNavigation('expiring-soon')}>
              Expiring Soon
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="max-w-3xl mx-auto bg-muted p-6 rounded-lg mt-8">
        <h2 className="text-xl font-bold mb-3">About PharmTrack</h2>
        <p className="mb-3">
          PharmTrack is designed to help pharmacies efficiently manage medicine expiration dates, 
          ensuring patient safety and reducing financial losses due to expired products.
        </p>
        <p>
          With automatic notifications, inventory management, and insightful analytics, 
          PharmTrack provides a complete solution for modern pharmacy management.
        </p>
      </div>
    </div>
  );
};

export default Home;
