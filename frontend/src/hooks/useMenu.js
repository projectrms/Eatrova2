import { useEffect, useState } from 'react';
import { apiGet } from '../api/api';

export function useMenu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    apiGet('/api/menu/')
      .then(data => { if (mounted) setMenu(data); })
      .catch(err => { if (mounted) setError(err); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { menu, loading, error };
}
