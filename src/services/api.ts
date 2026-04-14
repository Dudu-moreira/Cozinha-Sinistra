import { supabase } from './supabase';

// Performance monitoring helper
const withPerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`[API] ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    console.error(`[API] Error in ${name}:`, error);
    throw error;
  }
};

export const mapOrder = (o: any) => ({
  id: o.id,
  clientName: o.client_name,
  deliveryDate: o.delivery_date,
  totalValue: o.total_value,
  value: o.total_value,
  status: o.status,
  items: o.items,
  createdAt: o.created_at,
  userId: o.user_id
});

export const mapTask = (t: any) => ({
  id: t.id,
  title: t.title,
  dueDate: t.due_date,
  completed: t.completed,
  priority: t.priority,
  status: t.status || (t.completed ? 'Finalizado' : 'Pendente'),
  createdAt: t.created_at,
  userId: t.user_id
});

export const mapIngredient = (i: any) => ({
  id: i.id,
  name: i.name,
  quantity: i.quantity,
  unit: i.unit,
  minQuantity: i.min_quantity,
  createdAt: i.created_at,
  userId: i.user_id
});

export const mapTransaction = (t: any) => ({
  id: t.id,
  description: t.description,
  amount: t.amount,
  type: t.type,
  date: t.date,
  category: t.category,
  createdAt: t.created_at,
  userId: t.user_id
});

export const mapClient = (c: any) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email,
  address: c.address,
  orders: c.orders_count,
  total: c.total_spent,
  createdAt: c.created_at,
  userId: c.user_id
});

export const mapSupplier = (s: any) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  phone: s.phone,
  email: s.email,
  createdAt: s.created_at,
  userId: s.user_id
});

export const mapRecipe = (r: any) => ({
  id: r.id,
  name: r.name,
  ingredients: r.ingredients,
  yield: r.yield,
  cost: r.cost,
  createdAt: r.created_at,
  userId: r.user_id
});

export const mapCalculation = (c: any) => ({
  id: c.id,
  title: c.title,
  ingredients: c.ingredients,
  additionalCosts: c.additional_costs,
  profitMargin: c.profit_margin,
  production: c.production,
  totalValue: c.total_value,
  unitCost: c.unit_cost,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  userId: c.user_id
});

export const api = {
  // Orders
  getOrders: (userId: string) => 
    withPerformance('getOrders', async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data?.map(mapOrder) || [];
    }),
  
  addOrder: (data: any) => 
    withPerformance('addOrder', async () => {
      const { error } = await supabase.from('orders').insert([{
        client_name: data.clientName,
        delivery_date: data.deliveryDate,
        total_value: data.value,
        status: data.status,
        items: data.items || [],
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateOrder: (id: string, data: any) => 
    withPerformance('updateOrder', async () => {
      const { error } = await supabase.from('orders').update({
        client_name: data.clientName,
        delivery_date: data.deliveryDate,
        total_value: data.value,
        status: data.status,
        items: data.items
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteOrder: (id: string) => 
    withPerformance('deleteOrder', async () => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    }),

  // Tasks
  getTasks: (userId: string) => 
    withPerformance('getTasks', async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('due_date', { ascending: true });
      if (error) throw error;
      return data?.map(mapTask) || [];
    }),
  
  addTask: (data: any) => 
    withPerformance('addTask', async () => {
      const { error } = await supabase.from('tasks').insert([{
        title: data.title,
        due_date: data.dueDate,
        completed: data.completed || false,
        priority: data.priority,
        status: data.status,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateTask: (id: string, data: any) => 
    withPerformance('updateTask', async () => {
      const { error } = await supabase.from('tasks').update({
        title: data.title,
        due_date: data.dueDate,
        completed: data.completed,
        priority: data.priority,
        status: data.status
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteTask: (id: string) => 
    withPerformance('deleteTask', async () => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    }),

  // Ingredients
  getIngredients: (userId: string) => 
    withPerformance('getIngredients', async () => {
      const { data, error } = await supabase.from('ingredients').select('*').eq('user_id', userId).order('name', { ascending: true });
      if (error) throw error;
      return data?.map(mapIngredient) || [];
    }),
  
  addIngredient: (data: any) => 
    withPerformance('addIngredient', async () => {
      const { error } = await supabase.from('ingredients').insert([{
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        min_quantity: data.minQuantity,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateIngredient: (id: string, data: any) => 
    withPerformance('updateIngredient', async () => {
      const { error } = await supabase.from('ingredients').update({
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        min_quantity: data.minQuantity
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteIngredient: (id: string) => 
    withPerformance('deleteIngredient', async () => {
      const { error } = await supabase.from('ingredients').delete().eq('id', id);
      if (error) throw error;
    }),

  // Transactions
  getTransactions: (userId: string) => 
    withPerformance('getTransactions', async () => {
      const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
      if (error) throw error;
      return data?.map(mapTransaction) || [];
    }),
  
  addTransaction: (data: any) => 
    withPerformance('addTransaction', async () => {
      const { error } = await supabase.from('transactions').insert([{
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date,
        category: data.category,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateTransaction: (id: string, data: any) => 
    withPerformance('updateTransaction', async () => {
      const { error } = await supabase.from('transactions').update({
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date,
        category: data.category
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteTransaction: (id: string) => 
    withPerformance('deleteTransaction', async () => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    }),

  // Clients
  getClients: (userId: string) => 
    withPerformance('getClients', async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).order('name', { ascending: true });
      if (error) throw error;
      return data?.map(mapClient) || [];
    }),
  
  addClient: (data: any) => 
    withPerformance('addClient', async () => {
      const { error } = await supabase.from('clients').insert([{
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateClient: (id: string, data: any) => 
    withPerformance('updateClient', async () => {
      const { error } = await supabase.from('clients').update({
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteClient: (id: string) => 
    withPerformance('deleteClient', async () => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    }),

  // Suppliers
  getSuppliers: (userId: string) => 
    withPerformance('getSuppliers', async () => {
      const { data, error } = await supabase.from('suppliers').select('*').eq('user_id', userId).order('name', { ascending: true });
      if (error) throw error;
      return data?.map(mapSupplier) || [];
    }),
  
  addSupplier: (data: any) => 
    withPerformance('addSupplier', async () => {
      const { error } = await supabase.from('suppliers').insert([{
        name: data.name,
        category: data.category,
        phone: data.phone,
        email: data.email,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateSupplier: (id: string, data: any) => 
    withPerformance('updateSupplier', async () => {
      const { error } = await supabase.from('suppliers').update({
        name: data.name,
        category: data.category,
        phone: data.phone,
        email: data.email
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteSupplier: (id: string) => 
    withPerformance('deleteSupplier', async () => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    }),

  // Recipes
  getRecipes: (userId: string) => 
    withPerformance('getRecipes', async () => {
      const { data, error } = await supabase.from('recipes').select('*').eq('user_id', userId).order('name', { ascending: true });
      if (error) throw error;
      return data?.map(mapRecipe) || [];
    }),
  
  addRecipe: (data: any) => 
    withPerformance('addRecipe', async () => {
      const { error } = await supabase.from('recipes').insert([{
        name: data.name,
        ingredients: data.ingredients,
        yield: data.yield,
        cost: data.cost,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateRecipe: (id: string, data: any) => 
    withPerformance('updateRecipe', async () => {
      const { error } = await supabase.from('recipes').update({
        name: data.name,
        ingredients: data.ingredients,
        yield: data.yield,
        cost: data.cost
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteRecipe: (id: string) => 
    withPerformance('deleteRecipe', async () => {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
    }),

  // Production Columns
  getProductionColumns: (userId: string) => 
    withPerformance('getProductionColumns', async () => {
      const { data, error } = await supabase.from('production_columns').select('*').eq('user_id', userId).order('order', { ascending: true });
      if (error) throw error;
      return data || [];
    }),
  
  addProductionColumn: (data: any) => 
    withPerformance('addProductionColumn', async () => {
      const { error } = await supabase.from('production_columns').insert([{
        name: data.name,
        order: data.order,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateProductionColumn: (id: string, data: any) => 
    withPerformance('updateProductionColumn', async () => {
      const { error } = await supabase.from('production_columns').update({
        name: data.name,
        order: data.order
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteProductionColumn: (id: string) => 
    withPerformance('deleteProductionColumn', async () => {
      const { error } = await supabase.from('production_columns').delete().eq('id', id);
      if (error) throw error;
    }),

  updateTasksStatus: (oldStatus: string, newStatus: string, userId: string) =>
    withPerformance('updateTasksStatus', async () => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('status', oldStatus)
        .eq('user_id', userId);
      if (error) throw error;
    }),

  // Calculations
  getCalculations: (userId: string) => 
    withPerformance('getCalculations', async () => {
      const { data, error } = await supabase.from('calculations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data?.map(mapCalculation) || [];
    }),
  
  addCalculation: (data: any) => 
    withPerformance('addCalculation', async () => {
      const { error } = await supabase.from('calculations').insert([{
        title: data.title,
        ingredients: data.ingredients,
        additional_costs: data.additionalCosts,
        profit_margin: data.profitMargin,
        production: data.production,
        total_value: data.totalValue,
        unit_cost: data.unitCost,
        user_id: data.userId
      }]);
      if (error) throw error;
    }),
  
  updateCalculation: (id: string, data: any) => 
    withPerformance('updateCalculation', async () => {
      const { error } = await supabase.from('calculations').update({
        title: data.title,
        ingredients: data.ingredients,
        additional_costs: data.additionalCosts,
        profit_margin: data.profitMargin,
        production: data.production,
        total_value: data.totalValue,
        unit_cost: data.unitCost
      }).eq('id', id);
      if (error) throw error;
    }),
  
  deleteCalculation: (id: string) => 
    withPerformance('deleteCalculation', async () => {
      const { error } = await supabase.from('calculations').delete().eq('id', id);
      if (error) throw error;
    }),
};
