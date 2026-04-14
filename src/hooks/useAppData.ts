import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { api, mapOrder, mapTask, mapIngredient, mapTransaction, mapClient, mapSupplier, mapRecipe, mapCalculation } from '@/services/api';
import { Order, Task, Ingredient, Transaction, ProductionColumn, Calculation } from '@/types';

export function useAppData(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [productionColumns, setProductionColumns] = useState<ProductionColumn[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTable = useCallback(async (table: string) => {
    if (!userId) return;
    
    try {
      switch (table) {
        case 'orders':
          const ordersData = await api.getOrders(userId);
          setOrders(ordersData);
          break;
        case 'tasks':
          const tasksData = await api.getTasks(userId);
          setTasks(tasksData);
          break;
        case 'ingredients':
          const ingredientsData = await api.getIngredients(userId);
          setIngredients(ingredientsData);
          break;
        case 'transactions':
          const transactionsData = await api.getTransactions(userId);
          setTransactions(transactionsData);
          break;
        case 'clients':
          const clientsData = await api.getClients(userId);
          setClients(clientsData);
          break;
        case 'suppliers':
          const suppliersData = await api.getSuppliers(userId);
          setSuppliers(suppliersData);
          break;
        case 'recipes':
          const recipesData = await api.getRecipes(userId);
          setRecipes(recipesData);
          break;
        case 'production_columns':
          const columnsData = await api.getProductionColumns(userId);
          if (columnsData && columnsData.length > 0) {
            setProductionColumns(columnsData as any);
          } else {
            const defaults = [
              { name: 'A fazer', order: 0, user_id: userId },
              { name: 'Em andamento', order: 1, user_id: userId },
              { name: 'Finalizado', order: 2, user_id: userId }
            ];
            const { data: newCols } = await supabase.from('production_columns').insert(defaults).select();
            if (newCols) setProductionColumns(newCols as any);
          }
          break;
        case 'calculations':
          const calculationsData = await api.getCalculations(userId);
          setCalculations(calculationsData);
          break;
      }
    } catch (error) {
      console.error(`[AppData] Error fetching ${table}:`, error);
    }
  }, [userId]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchTable('orders'),
        fetchTable('tasks'),
        fetchTable('ingredients'),
        fetchTable('transactions'),
        fetchTable('clients'),
        fetchTable('suppliers'),
        fetchTable('recipes'),
        fetchTable('production_columns'),
        fetchTable('calculations')
      ]);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchTable]);

  useEffect(() => {
    if (!userId) return;

    fetchData();

    // Set up granular real-time subscriptions with immediate state updates
    const tables = [
      'orders', 'tasks', 'ingredients', 'transactions', 
      'clients', 'suppliers', 'recipes', 'production_columns', 'calculations'
    ];

    const setterMap: Record<string, { setter: any, mapper: any }> = {
      orders: { setter: setOrders, mapper: mapOrder },
      tasks: { setter: setTasks, mapper: mapTask },
      ingredients: { setter: setIngredients, mapper: mapIngredient },
      transactions: { setter: setTransactions, mapper: mapTransaction },
      clients: { setter: setClients, mapper: mapClient },
      suppliers: { setter: setSuppliers, mapper: mapSupplier },
      recipes: { setter: setRecipes, mapper: mapRecipe },
      production_columns: { setter: setProductionColumns, mapper: (v: any) => v },
      calculations: { setter: setCalculations, mapper: mapCalculation },
    };

    const channels = tables.map(table => 
      supabase.channel(`${table}-changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` }, 
          (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            const { setter, mapper } = setterMap[table];
            
            if (eventType === 'INSERT') {
              setter((prev: any[]) => [mapper(newRecord), ...prev]);
            } else if (eventType === 'UPDATE') {
              setter((prev: any[]) => prev.map(item => item.id === newRecord.id ? mapper(newRecord) : item));
            } else if (eventType === 'DELETE') {
              setter((prev: any[]) => prev.filter(item => item.id !== oldRecord.id));
            }
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, fetchData]);

  return {
    orders,
    tasks,
    ingredients,
    transactions,
    clients,
    suppliers,
    recipes,
    productionColumns,
    calculations,
    loading,
    refresh: fetchData
  };
}
