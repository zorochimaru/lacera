export interface Order {
  customerName: string;
  customerPhoneNumber: string;
  customerEmail: string;
  completed: boolean;
  products: {
    productId: string;
    quantity: number;
  }[];
}
