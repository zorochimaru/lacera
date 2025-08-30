export interface Order {
  customerName: string;
  customerPhoneNumber: string;
  customerPhoneEmail: string;
  completed: boolean;
  products: {
    productId: string;
    quantity: number;
  }[];
}
