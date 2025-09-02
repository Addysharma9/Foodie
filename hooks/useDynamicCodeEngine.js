// hooks/useDynamicCodeEngine.js
import { useState, useEffect } from 'react';

const baseURL = 'http://212.38.94.189:8000';

export const useDynamicCodeEngine = () => {
  const [componentCode, setComponentCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${baseURL}/api/dynamic-component-code`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setComponentCode(data);
    } catch (err) {
      console.error('Error fetching dynamic code:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshCode = () => {
    fetchCode();
  };

  useEffect(() => {
    fetchCode();
  }, []);

  return {
    componentCode,
    loading,
    error,
    refreshCode
  };
};
