import React, { useState, useEffect } from 'react';
import {
  startBatchProcessing,
  getQueueStatus,
  submitPrompt
} from '../api';

const BatchProcessor = () => {
  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState('idle');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (processing) {
        getQueueStatus()
          .then((data) => {
            setStatus(data.status);
            if (data.status === 'done') {
              setProcessing(false);
            }
          })
          .catch((error) => {
            console.error('Error checking queue status:', error);
          });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [processing]);

  const handleStartBatch = async () => {
    try {
      setProcessing(true);
      const prompts = queue.map((item) => item.prompt);
      const response = await startBatchProcessing(prompts);
      setStatus('processing');
      console.log('Batch started:', response);
    } catch (err) {
      console.error('Error starting batch:', err);
    }
  };

  const handleAddPrompt = () => {
    if (currentPrompt.trim() === '') return;
    setQueue([...queue, { prompt: currentPrompt }]);
    setCurrentPrompt('');
  };

  const handleSubmitSinglePrompt = async () => {
    if (currentPrompt.trim() === '') return;
    try {
      const response = await submitPrompt(currentPrompt);
      setResult(response.result || JSON.stringify(response));
    } catch (err) {
      console.error('Prompt submission error:', err);
      setResult('Error submitting prompt');
    }
  };

  return (
    <div className="batch-processor">
      <h2>Batch Prompt Processor</h2>

      <div>
        <textarea
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          placeholder="Enter a prompt..."
          rows={4}
          cols={50}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleAddPrompt}>+ Add to Queue</button>
        <button onClick={handleSubmitSinglePrompt} style={{ marginLeft: '10px' }}>
          → Submit Single Prompt
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleStartBatch} disabled={queue.length === 0 || processing}>
          ▶️ Start Batch
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <strong>Status:</strong> {status}
      </div>

      {queue.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Queue</h4>
          <ul>
            {queue.map((item, idx) => (
              <li key={idx}>{item.prompt}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Result</h4>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default BatchProcessor;
