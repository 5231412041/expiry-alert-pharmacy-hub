
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Package, Loader2, Search, AlertTriangle, Plus, FileDown, RefreshCw, MinusCircle, PlusCircle } from 'lucide-react';
import { getAllMedicines } from '../../services/medicineService';
import { updateMedicineStock } from '../../services/inventoryService';
import { MedicineWithStatus } from '../../types/models';
import { Badge } from '@/components/ui/badge';

const Inventory = () => {
  const [medicines, setMedicines] = useState<MedicineWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineWithStatus | null>(null);
  const [stockChange, setStockChange] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  
  useEffect(() => {
    loadMedicines();
  }, []);
  
  const loadMedicines = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error('Error loading medicines:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inventory data"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStockAdjust = async () => {
    if (!selectedMedicine) return;
    
    setIsUpdating(true);
    try {
      const newQuantity = Math.max(0, selectedMedicine.quantity + stockChange);
      await updateMedicineStock(selectedMedicine.id, newQuantity);
      
      // Update local state
      setMedicines(medicines.map(med => 
        med.id === selectedMedicine.id 
          ? { ...med, quantity: newQuantity } 
          : med
      ));
      
      toast({
        title: "Stock Updated",
        description: `${selectedMedicine.name} stock adjusted by ${stockChange > 0 ? '+' : ''}${stockChange}`,
      });
      
      setIsAdjustDialogOpen(false);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const openAdjustDialog = (medicine: MedicineWithStatus) => {
    setSelectedMedicine(medicine);
    setStockChange(0);
    setIsAdjustDialogOpen(true);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  
  const filteredMedicines = medicines.filter(medicine => 
    medicine.name.toLowerCase().includes(searchTerm) ||
    medicine.batch.toLowerCase().includes(searchTerm) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm)
  );

  // Get medicines with low stock (less than 10)
  const lowStockCount = medicines.filter(med => med.quantity < 10).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Items</CardTitle>
            <CardDescription>Total medicines in inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{medicines.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Low Stock</CardTitle>
            <CardDescription>Medicines with quantity below 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{lowStockCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Out of Stock</CardTitle>
            <CardDescription>Medicines with zero quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {medicines.filter(med => med.quantity === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search medicines by name, batch or manufacturer..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMedicines}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading inventory...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-muted-foreground">No medicines found</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.batch}</TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>{medicine.expiryDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          medicine.status === 'expired'
                            ? 'border-red-500 text-red-500'
                            : medicine.status === 'expiring-soon'
                            ? 'border-orange-500 text-orange-500'
                            : 'border-green-500 text-green-500'
                        }
                      >
                        {medicine.status === 'expired'
                          ? 'Expired'
                          : medicine.status === 'expiring-soon'
                          ? 'Expiring Soon'
                          : 'Safe'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={medicine.quantity < 10 ? "text-red-500 font-semibold" : ""}>
                        {medicine.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustDialog(medicine)}
                      >
                        Adjust Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update inventory quantity for {selectedMedicine?.name} (Batch: {selectedMedicine?.batch})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Current Stock:</Label>
              <span className="font-semibold">{selectedMedicine?.quantity || 0}</span>
            </div>
            
            <div className="space-y-2">
              <Label>Stock Adjustment:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setStockChange(prev => prev - 1)}
                  disabled={selectedMedicine?.quantity === 0 && stockChange <= 0}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={stockChange}
                  onChange={(e) => setStockChange(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setStockChange(prev => prev + 1)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use positive values to increase stock, negative to decrease
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>New Stock Level:</Label>
              <span className="font-semibold">
                {Math.max(0, (selectedMedicine?.quantity || 0) + stockChange)}
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockAdjust} disabled={isUpdating || stockChange === 0}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Update Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
