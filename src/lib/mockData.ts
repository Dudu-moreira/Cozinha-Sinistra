import { Order, Task, Ingredient, Transaction, Client } from '../types';

export const mockOrders: Order[] = [
  { id: '1', clientName: 'Maria Silva', product: 'Bolo de Chocolate', deliveryDate: '2026-04-10', status: 'Pendente', value: 150, createdAt: '2026-04-08' },
  { id: '2', clientName: 'João Pereira', product: 'Cento de Brigadeiros', deliveryDate: '2026-04-12', status: 'Em Produção', value: 120, createdAt: '2026-04-08' },
  { id: '3', clientName: 'Ana Costa', product: 'Torta de Limão', deliveryDate: '2026-04-15', status: 'Finalizado', value: 85, createdAt: '2026-04-07' },
];

export const mockTasks: Task[] = [
  { id: '1', title: 'Comprar morangos', status: 'A fazer', dueDate: '2026-04-09' },
  { id: '2', title: 'Preparar massa do bolo', status: 'Em andamento', dueDate: '2026-04-09' },
  { id: '3', title: 'Entregar pedido #3', status: 'Finalizado', dueDate: '2026-04-08' },
];

export const mockIngredients: Ingredient[] = [
  { id: '1', name: 'Farinha de Trigo', quantity: 5, unit: 'kg', minQuantity: 2 },
  { id: '2', name: 'Açúcar', quantity: 3, unit: 'kg', minQuantity: 1 },
  { id: '3', name: 'Manteiga', quantity: 0.5, unit: 'kg', minQuantity: 1 },
];

export const mockTransactions: Transaction[] = [
  { id: '1', description: 'Venda Bolo Chocolate', amount: 150, type: 'Entrada', date: '2026-04-08', category: 'Vendas' },
  { id: '2', description: 'Compra Ingredientes', amount: 45, type: 'Saída', date: '2026-04-08', category: 'Insumos' },
  { id: '3', description: 'Venda Brigadeiros', amount: 120, type: 'Entrada', date: '2026-04-07', category: 'Vendas' },
];

export const mockClients: Client[] = [
  { id: '1', name: 'Maria Silva', email: 'maria@email.com', phone: '(11) 99999-9999', address: 'Rua das Flores, 123' },
  { id: '2', name: 'João Pereira', email: 'joao@email.com', phone: '(11) 88888-8888', address: 'Av. Brasil, 456' },
];
