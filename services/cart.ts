import { CartDTO, CreateCartItemValues } from './dto/cart.dto';
import { axiosInstance } from './instance';

export const getCart = async (): Promise<CartDTO> => {
  const { data } = await axiosInstance.get<CartDTO>('/cart');

  return data;
};

export const updateItemQuantity = async (itemId: string, quantity: number): Promise<CartDTO> => {
  const { data } = await axiosInstance.patch<CartDTO>('/cart/' + itemId, { quantity });

  return data;
};

export const removeCartItem = async (itemId: string): Promise<CartDTO> => {
  const { data } = await axiosInstance.delete<CartDTO>('/cart/' + itemId);

  return data;
};

export const addCartItem = async (values: CreateCartItemValues): Promise<CartDTO> => {
  const { data } = await axiosInstance.post<CartDTO>('/cart', values);

  return data;
};
