
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const History = () => {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    fetchPromptHistory();
  }, []);

  const fetchPromptHistory = async () => {
    const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error loading history:", error);
    else setPrompts(data);
  };

  return (
    <div>
      <h2>Prompt History</h2>
      <ul>
        {prompts.map((prompt) => (
          <li key={prompt.id}>
            <strong>Status:</strong> {prompt.status}<br />
            <pre>{prompt.content}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
