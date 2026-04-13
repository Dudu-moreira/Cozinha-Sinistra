export type OrderStatus = 'Pendente' | 'Em Produção' | 'Finalizado' | 'Entregue' | 'Cancelado';

export interface Order {
  id: string;
  clientName: string;
  product: string;
  deliveryDate: string;
  status: OrderStatus;
  value: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
}

export interface ProductionColumn {
  id: string;
  name: string;
  order: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: {
    ingredientId: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  yield: string;
  cost: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'Entrada' | 'Saída';
  date: string;
  category: string;
}

export interface Calculation {
  id: string;
  title: string;
  ingredients: {
    id: string;
    name: string;
    price: string;
    totalQty: string;
    usedQty: string;
  }[];
  additionalCosts: {
    expenses: string;
    labor: string;
    filling: string;
  };
  profitMargin: string;
  production: {
    yield: string;
    weight: string;
  };
  totalValue: number;
  unitCost: number;
  createdAt: any;
  updatedAt: any;
}
