
import React, { useEffect, useState } from 'react';
import { getQueueStatus } from '../utils/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BatchProcessor = () => {
  const [queueStatus, setQueueStatus] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await getQueueStatus();
        setQueueStatus(status);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartBatch = async () => {
    try {
      toast.info("Submitting prompts...");
      // assume some logic to submit prompts
      toast.success("Batch started!");
    } catch (err) {
      toast.error("Failed to start batch");
    }
  };

  return (
    <div>
      <h2>Batch Queue Status</h2>
      <pre>{JSON.stringify(queueStatus, null, 2)}</pre>
      <button onClick={handleStartBatch}>Start Batch</button>
    </div>
  );
};

export default BatchProcessor;
