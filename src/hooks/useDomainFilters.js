import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { filterDomains, sanitizeList } from '../utils/domainFilters';

const SOURCE_URL = 'https://registro.br/dominio/lista-processo-liberacao.txt';

export function useDomainFilters() {
  const [rawList, setRawList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    query: '',
    mode: 'contains',
    regex: '',
    startsWith: '',
    endsWith: '',
    minLength: 3,
    maxLength: 30,
    maxHyphens: 2,
    minReadable: 0,
    allowNumbers: true,
    onlyNoHyphen: false,
    onlyLetters: false,
    sortBy: 'score'
  });

  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(SOURCE_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Falha ao baixar a lista de domínios');
        const text = await response.text();
        setRawList(sanitizeList(text));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, []);

  const result = useMemo(() => {
    return filterDomains(rawList, { ...filters, query: deferredQuery });
  }, [rawList, filters, deferredQuery]);

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters((prev) => ({ ...prev, query: '', regex: '', startsWith: '', endsWith: '' }));
  };

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    domains: result,
    total: rawList.length,
    loading,
    error
  };
}
