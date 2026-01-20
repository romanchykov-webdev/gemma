export interface CartItemProps {
  id: string; // UUID теперь
  imageUrl: string;
  details: {
    base: string;
    added: string;
    removed: string;
  };
  name: string;
  price: number;
  quantity: number;
}
