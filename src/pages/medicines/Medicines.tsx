
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Search, PlusCircle, AlertTriangle, Filter } from 'lucide-react';
import { getAllMedicines, deleteMedicine } from '../../services/medicineService';
import { MedicineWithStatus, MedicineStatus } from '../../types/models';
import MedicineCard from '../../components/medicines/MedicineCard';
import AddMedicineDialog from '../../components/medicines/AddMedicineDialog';
import { toast } from '@/components/ui/use-toast';

const Medicines = () => {
  const [medicines, setMedicines] = useState<MedicineWithStatus[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<MedicineWithStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const allMedicines = await getAllMedicines();
        setMedicines(allMedicines);
        setFilteredMedicines(allMedicines);
      } catch (error) {
        console.error('Error loading medicines:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load medicines"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMedicines();
  }, []);
  
  useEffect(() => {
    // Apply filters
    let results = medicines;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(med => med.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMedicines(results);
  }, [medicines, searchTerm, statusFilter]);
  
  const handleDelete = async (id: string) => {
    try {
      await deleteMedicine(id);
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
  
  const handleAddMedicine = (newMedicine: MedicineWithStatus) => {
    setMedicines(prev => [...prev, newMedicine]);
    toast({
      title: "Success",
      description: "Medicine added successfully"
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading medicines...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Medicines</h1>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search medicines..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Medicines</SelectItem>
              <SelectItem value={MedicineStatus.SAFE}>Safe</SelectItem>
              <SelectItem value={MedicineStatus.EXPIRING_SOON}>Expiring Soon</SelectItem>
              <SelectItem value={MedicineStatus.EXPIRED}>Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredMedicines.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
          <h3 className="mt-4 text-xl font-medium">No medicines found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filters" 
              : "Start by adding a medicine to your inventory"}
          </p>
          
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Medicine
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
      
      <AddMedicineDialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)}
        onAddMedicine={handleAddMedicine}
      />
    </div>
  );
};

export default Medicines;
