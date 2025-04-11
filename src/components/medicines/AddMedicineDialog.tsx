
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { addMedicine } from '../../services/medicineService';
import { MedicineWithStatus, Medicine } from '../../types/models';
import { useAuth } from '../../contexts/AuthContext';

interface AddMedicineDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMedicine: (medicine: MedicineWithStatus) => void;
}

const AddMedicineDialog: React.FC<AddMedicineDialogProps> = ({ 
  open, 
  onClose, 
  onAddMedicine 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    quantity: 1,
    manufacturer: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const medicineData: Omit<Medicine, 'id' | 'addedAt'> = {
        name: formData.name,
        batch: formData.batch,
        quantity: Number(formData.quantity),
        manufacturer: formData.manufacturer,
        manufactureDate: new Date(formData.manufactureDate),
        expiryDate: new Date(formData.expiryDate),
        addedBy: user.email
      };
      
      const newMedicine = await addMedicine(medicineData);
      onAddMedicine({
        ...newMedicine,
        status: calculateMedicineStatus(newMedicine.expiryDate)
      });
      
      // Reset form
      setFormData({
        name: '',
        batch: '',
        quantity: 1,
        manufacturer: '',
        manufactureDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to add medicine:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to calculate medicine status
  function calculateMedicineStatus(expiryDate: Date) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (expiryDate < now) {
      return 'expired' as const;
    } else if (expiryDate < thirtyDaysFromNow) {
      return 'expiring-soon' as const;
    } else {
      return 'safe' as const;
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isLoading && !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Paracetamol"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Number*</Label>
              <Input
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                required
                placeholder="e.g., B12345"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity*</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., ABC Pharma"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufactureDate">Manufacture Date</Label>
                <Input
                  id="manufactureDate"
                  name="manufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date*</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Medicine'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedicineDialog;
