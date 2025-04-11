
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { getMedicineSummary } from '../../services/medicineService';
import { SummaryStats, ChartData } from '../../types/models';

const Dashboard = () => {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Colors for the charts
  const COLORS = ['#10B981', '#F97316', '#EF4444'];
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const summary = await getMedicineSummary();
        setStats(summary);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <span className="ml-2 text-lg">{error || 'Something went wrong'}</span>
      </div>
    );
  }
  
  // Prepare data for pie chart
  const pieChartData: ChartData[] = [
    { name: 'Safe', value: stats.safe },
    { name: 'Expiring Soon', value: stats.expiringSoon },
    { name: 'Expired', value: stats.expired }
  ].filter(item => item.value > 0);
  
  // Prepare data for bar chart
  const barChartData = [
    {
      name: 'Medicine Status',
      Safe: stats.safe,
      'Expiring Soon': stats.expiringSoon,
      Expired: stats.expired
    }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stats-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Medicines</h3>
            <span className="text-lg font-semibold">{stats.total}</span>
          </div>
        </Card>
        
        <Card className="stats-card alert-safe">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-pharmacy-green mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Safe</h3>
            </div>
            <span className="text-lg font-semibold">{stats.safe}</span>
          </div>
        </Card>
        
        <Card className="stats-card alert-expiring">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-pharmacy-orange mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Expiring Soon</h3>
            </div>
            <span className="text-lg font-semibold">{stats.expiringSoon}</span>
          </div>
        </Card>
        
        <Card className="stats-card alert-expired">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-pharmacy-red mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Expired</h3>
            </div>
            <span className="text-lg font-semibold">{stats.expired}</span>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Medicine Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Medicine Status Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Safe" fill="#10B981" />
                <Bar dataKey="Expiring Soon" fill="#F97316" />
                <Bar dataKey="Expired" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
