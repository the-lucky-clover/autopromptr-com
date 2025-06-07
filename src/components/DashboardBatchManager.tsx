
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Batch } from '@/types/batch';
import BatchModal from './BatchModal';
import DashboardBatchList from './DashboardBatchList';

const DashboardBatchManager = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const handleCreateBatch = (batchData: Omit<Batch, 'id' | 'createdAt'>) => {
    const newBatch: Batch = {
      ...batchData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setBatches([...batches, newBatch]);
    setShowModal(false);
  };

  const handleUpdateBatch = (updatedBatch: Batch) => {
    setBatches(batches.map(batch => 
      batch.id === updatedBatch.id ? updatedBatch : batch
    ));
    setShowModal(false);
    setEditingBatch(null);
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatches(batches.filter(batch => batch.id !== batchId));
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleNewBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      {batches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/70 mb-4">No batches created yet</p>
          <Button 
            onClick={handleNewBatch}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Batch
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Your Batches</h3>
            <Button 
              onClick={handleNewBatch}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </Button>
          </div>
          <DashboardBatchList 
            batches={batches}
            onEdit={handleEditBatch}
            onDelete={handleDeleteBatch}
          />
        </>
      )}

      <BatchModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBatch(null);
        }}
        onSave={editingBatch ? handleUpdateBatch : handleCreateBatch}
        editingBatch={editingBatch}
      />
    </div>
  );
};

export default DashboardBatchManager;
