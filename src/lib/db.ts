import { supabase } from './supabase';

const mapOrder = (o: any) => ({
  id: o.id,
  clientName: o.client_name,
  deliveryDate: o.delivery_date,
  totalValue: o.total_value,
  value: o.total_value, // For compatibility
  status: o.status,
  items: o.items,
  createdAt: o.created_at,
  userId: o.user_id
});

const mapTask = (t: any) => ({
  id: t.id,
  title: t.title,
  dueDate: t.due_date,
  completed: t.completed,
  priority: t.priority,
  status: t.status || (t.completed ? 'Finalizado' : 'Pendente'),
  createdAt: t.created_at,
  userId: t.user_id
});

const mapIngredient = (i: any) => ({
  id: i.id,
  name: i.name,
  quantity: i.quantity,
  unit: i.unit,
  minQuantity: i.min_quantity,
  createdAt: i.created_at,
  userId: i.user_id
});

const mapTransaction = (t: any) => ({
  id: t.id,
  description: t.description,
  amount: t.amount,
  type: t.type,
  date: t.date,
  category: t.category,
  createdAt: t.created_at,
  userId: t.user_id
});

const mapClient = (c: any) => ({
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

const mapSupplier = (s: any) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  phone: s.phone,
  email: s.email,
  createdAt: s.created_at,
  userId: s.user_id
});

const mapRecipe = (r: any) => ({
  id: r.id,
  name: r.name,
  ingredients: r.ingredients,
  yield: r.yield,
  cost: r.cost,
  createdAt: r.created_at,
  userId: r.user_id
});

const mapCalculation = (c: any) => ({
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

export const db = {
  // Orders
  getOrders: async (userId: string) => {
    const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return { data: data?.map(mapOrder) || [] };
  },
  
  addOrder: (data: any) => 
    supabase.from('orders').insert([{
      client_name: data.clientName,
      delivery_date: data.deliveryDate,
      total_value: data.value,
      status: data.status,
      items: data.items || [],
      user_id: data.userId
    }]),
  
  updateOrder: (id: string, data: any) => 
    supabase.from('orders').update({
      client_name: data.clientName,
      delivery_date: data.deliveryDate,
      total_value: data.value,
      status: data.status,
      items: data.items
    }).eq('id', id),
  
  deleteOrder: (id: string) => 
    supabase.from('orders').delete().eq('id', id),

  // Tasks
  getTasks: async (userId: string) => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('due_date', { ascending: true });
    return { data: data?.map(mapTask) || [] };
  },
  
  addTask: (data: any) => 
    supabase.from('tasks').insert([{
      title: data.title,
      due_date: data.dueDate,
      completed: data.completed || false,
      priority: data.priority,
      status: data.status,
      user_id: data.userId
    }]),
  
  updateTask: (id: string, data: any) => 
    supabase.from('tasks').update({
      title: data.title,
      due_date: data.dueDate,
      completed: data.completed,
      priority: data.priority,
      status: data.status
    }).eq('id', id),
  
  deleteTask: (id: string) => 
    supabase.from('tasks').delete().eq('id', id),

  // Ingredients
  getIngredients: async (userId: string) => {
    const { data } = await supabase.from('ingredients').select('*').eq('user_id', userId).order('name', { ascending: true });
    return { data: data?.map(mapIngredient) || [] };
  },
  
  addIngredient: (data: any) => 
    supabase.from('ingredients').insert([{
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      min_quantity: data.minQuantity,
      user_id: data.userId
    }]),
  
  updateIngredient: (id: string, data: any) => 
    supabase.from('ingredients').update({
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      min_quantity: data.minQuantity
    }).eq('id', id),
  
  deleteIngredient: (id: string) => 
    supabase.from('ingredients').delete().eq('id', id),

  // Transactions
  getTransactions: async (userId: string) => {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
    return { data: data?.map(mapTransaction) || [] };
  },
  
  addTransaction: (data: any) => 
    supabase.from('transactions').insert([{
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: data.date,
      category: data.category,
      user_id: data.userId
    }]),
  
  updateTransaction: (id: string, data: any) => 
    supabase.from('transactions').update({
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: data.date,
      category: data.category
    }).eq('id', id),
  
  deleteTransaction: (id: string) => 
    supabase.from('transactions').delete().eq('id', id),

  // Clients
  getClients: async (userId: string) => {
    const { data } = await supabase.from('clients').select('*').eq('user_id', userId).order('name', { ascending: true });
    return { data: data?.map(mapClient) || [] };
  },
  
  addClient: (data: any) => 
    supabase.from('clients').insert([{
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      user_id: data.userId
    }]),
  
  updateClient: (id: string, data: any) => 
    supabase.from('clients').update({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address
    }).eq('id', id),
  
  deleteClient: (id: string) => 
    supabase.from('clients').delete().eq('id', id),

  // Suppliers
  getSuppliers: async (userId: string) => {
    const { data } = await supabase.from('suppliers').select('*').eq('user_id', userId).order('name', { ascending: true });
    return { data: data?.map(mapSupplier) || [] };
  },
  
  addSupplier: (data: any) => 
    supabase.from('suppliers').insert([{
      name: data.name,
      category: data.category,
      phone: data.phone,
      email: data.email,
      user_id: data.userId
    }]),
  
  updateSupplier: (id: string, data: any) => 
    supabase.from('suppliers').update({
      name: data.name,
      category: data.category,
      phone: data.phone,
      email: data.email
    }).eq('id', id),
  
  deleteSupplier: (id: string) => 
    supabase.from('suppliers').delete().eq('id', id),

  // Recipes
  getRecipes: async (userId: string) => {
    const { data } = await supabase.from('recipes').select('*').eq('user_id', userId).order('name', { ascending: true });
    return { data: data?.map(mapRecipe) || [] };
  },
  
  addRecipe: (data: any) => 
    supabase.from('recipes').insert([{
      name: data.name,
      ingredients: data.ingredients,
      yield: data.yield,
      cost: data.cost,
      user_id: data.userId
    }]),
  
  updateRecipe: (id: string, data: any) => 
    supabase.from('recipes').update({
      name: data.name,
      ingredients: data.ingredients,
      yield: data.yield,
      cost: data.cost
    }).eq('id', id),
  
  deleteRecipe: (id: string) => 
    supabase.from('recipes').delete().eq('id', id),

  // Production Columns
  getProductionColumns: async (userId: string) => {
    const { data } = await supabase.from('production_columns').select('*').eq('user_id', userId).order('order', { ascending: true });
    return { data: data || [] };
  },
  
  addProductionColumn: (data: any) => 
    supabase.from('production_columns').insert([{
      name: data.name,
      order: data.order,
      user_id: data.userId
    }]),
  
  updateProductionColumn: (id: string, data: any) => 
    supabase.from('production_columns').update({
      name: data.name,
      order: data.order
    }).eq('id', id),
  
  deleteProductionColumn: (id: string) => 
    supabase.from('production_columns').delete().eq('id', id),

  // Calculations
  getCalculations: async (userId: string) => {
    const { data } = await supabase.from('calculations').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return { data: data?.map(mapCalculation) || [] };
  },
  
  addCalculation: (data: any) => 
    supabase.from('calculations').insert([{
      title: data.title,
      ingredients: data.ingredients,
      additional_costs: data.additionalCosts,
      profit_margin: data.profitMargin,
      production: data.production,
      total_value: data.totalValue,
      unit_cost: data.unitCost,
      user_id: data.userId
    }]),
  
  updateCalculation: (id: string, data: any) => 
    supabase.from('calculations').update({
      title: data.title,
      ingredients: data.ingredients,
      additional_costs: data.additionalCosts,
      profit_margin: data.profitMargin,
      production: data.production,
      total_value: data.totalValue,
      unit_cost: data.unitCost
    }).eq('id', id),
  
  deleteCalculation: (id: string) => 
    supabase.from('calculations').delete().eq('id', id),
};
