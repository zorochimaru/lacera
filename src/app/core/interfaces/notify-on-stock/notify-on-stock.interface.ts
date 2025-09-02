export interface NotifyOnStock {
  customerName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  completed: boolean;
  productNames: string[];
  productIds: string[];
  amount: number;
}
