export interface Order {
  customerName: string;
  customerPhoneNumber: string;
  completed: boolean;
  products: {
    productId: string;
    quantity: number;
  }[];
}
