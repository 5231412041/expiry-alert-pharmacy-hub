
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Search, CheckCircle } from 'lucide-react';
import { getMedicinesByStatus } from '../../services/medicineService';
import { MedicineStatus, MedicineWithStatus } from '../../types/models';
import MedicineCard from '../../components/medicines/MedicineCard';
import { toast } from '@/components/ui/use-toast';

const SafeMedicines = () => {
  const [medicines, setMedicines] = useState<MedicineWithStatus[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<MedicineWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const safeMedicines = await getMedicinesByStatus(MedicineStatus.SAFE);
        setMedicines(safeMedicines);
        setFilteredMedicines(safeMedicines);
      } catch (error) {
        console.error('Error loading safe medicines:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load safe medicines"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMedicines();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      const results = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(results);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [medicines, searchTerm]);
  
  const handleDelete = async (id: string) => {
    try {
      // This would call the deletion service
      setMedicines(prev => prev.filter(med => med.id !== id));
      toast({
        title: "Success",
        description: "Medicine deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete medicine"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading safe medicines...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-6 w-6 text-pharmacy-green" />
        <h1 className="text-2xl font-bold">Safe Medicines</h1>
      </div>
      
      <Card className="p-4 bg-green-50 border-pharmacy-green flex items-center">
        <CheckCircle className="h-5 w-5 text-pharmacy-green mr-3" />
        <p className="text-sm">
          These medicines are safe to use and are not expiring within the next 30 days.
        </p>
      </Card>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search safe medicines..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredMedicines.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-medium">No safe medicines found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm 
              ? "No safe medicines match your search" 
              : "Add medicines to your inventory"}
          </p>
          
          <Button variant="outline" className="mt-4" asChild>
            <a href="/medicines">View All Medicines</a>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map(medicine => (
            <MedicineCard 
              key={medicine.id} 
              medicine={medicine} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SafeMedicines;
