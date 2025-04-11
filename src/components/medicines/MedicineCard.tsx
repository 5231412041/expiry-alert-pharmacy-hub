
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Calendar, 
  Package, 
  Hash, 
  Factory,
  Trash2,
  Edit
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MedicineWithStatus, MedicineStatus } from '../../types/models';
import { cn } from '../../lib/utils';

interface MedicineCardProps {
  medicine: MedicineWithStatus;
  onDelete: (id: string) => Promise<void>;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  
  const handleDelete = async () => {
    await onDelete(medicine.id);
    setIsDeleteDialogOpen(false);
  };
  
  const getStatusInfo = () => {
    switch (medicine.status) {
      case MedicineStatus.EXPIRED:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-pharmacy-red" />,
          text: 'Expired',
          class: 'bg-red-50 text-pharmacy-red border-pharmacy-red',
        };
      case MedicineStatus.EXPIRING_SOON:
        return {
          icon: <Clock className="h-5 w-5 text-pharmacy-orange" />,
          text: 'Expiring Soon',
          class: 'bg-orange-50 text-pharmacy-orange border-pharmacy-orange',
        };
      case MedicineStatus.SAFE:
      default:
        return {
          icon: <CheckCircle className="h-5 w-5 text-pharmacy-green" />,
          text: 'Safe',
          class: 'bg-green-50 text-pharmacy-green border-pharmacy-green',
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <Card className={cn(
      "pharmacy-card overflow-hidden",
      medicine.status === MedicineStatus.EXPIRED ? "alert-expired" :
      medicine.status === MedicineStatus.EXPIRING_SOON ? "alert-expiring" :
      "alert-safe"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg truncate" title={medicine.name}>{medicine.name}</h3>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-semibold flex items-center",
            statusInfo.class
          )}>
            {statusInfo.icon}
            <span className="ml-1">{statusInfo.text}</span>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm">
            <Hash className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">Batch: {medicine.batch}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Package className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">Quantity: {medicine.quantity}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Factory className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700 truncate" title={medicine.manufacturer}>
              {medicine.manufacturer || "Not specified"}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">
              Expiry: {medicine.expiryDate.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" size="sm" className="text-gray-600">
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p className="py-4">
                Are you sure you want to delete <strong>{medicine.name}</strong> ({medicine.batch})? 
                This action cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicineCard;
