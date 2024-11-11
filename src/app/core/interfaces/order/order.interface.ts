export interface Order {
  customerPhoneNumber: string;
  orders: {
    productId: string;
    quantity: number;
  }[];
}
