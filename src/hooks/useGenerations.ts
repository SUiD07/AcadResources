import { useState, useEffect } from 'react';
import { getGenerations, addGeneration } from '../lib/dataService';
import type { Generation } from '../lib/types';

export function useGenerations() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGenerations().then((data) => {
      setGenerations(data);
      setLoading(false);
    });
  }, []);

  const createGeneration = async (name: string, slug: string, color?: string) => {
    const maxOrder = generations.reduce((m, g) => Math.max(m, g.order_index), -1);
    const gen = await addGeneration({
      name,
      slug,
      color: color ?? '#6366f1',
      order_index: maxOrder + 1,
    });
    setGenerations((prev) => [...prev, gen]);
    return gen;
  };

  return { generations, loading, createGeneration };
}