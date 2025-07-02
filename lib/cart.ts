// Shopping cart utilities for Palestinian Kufiya Store

export interface Product {
  id: number
  name: string
  name_ar: string
  description: string
  description_ar: string
  price: number
  original_price?: number
  category: string
  sku: string
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  image_primary: string
  image_hover: string
  image_gallery?: string[]
  meta_title?: string
  meta_description?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  price: number
  product: Product
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  itemCount: number
  totalQuantity: number
}

const CART_KEY = 'kufiya_cart_items';

export function getCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export async function addToCart(product: Product, quantity = 1): Promise<{ success: boolean; error?: string }> {
  try {
    let cart = getCartFromStorage();
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity + quantity > product.stock_quantity) {
        return { success: false, error: 'Insufficient stock' };
      }
      existing.quantity += quantity;
    } else {
      if (quantity > product.stock_quantity) {
        return { success: false, error: 'Insufficient stock' };
      }
      cart.push({
        id: Date.now(),
        product_id: product.id,
        quantity,
        price: product.price,
        product,
      });
    }
    saveCartToStorage(cart);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function removeFromCart(cartItemId: number): Promise<{ success: boolean; error?: string }> {
  try {
    let cart = getCartFromStorage();
    cart = cart.filter(item => item.id !== cartItemId);
    saveCartToStorage(cart);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    let cart = getCartFromStorage();
    const item = cart.find(item => item.id === cartItemId);
    if (!item) return { success: false, error: 'Cart item not found' };
    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }
    if (quantity > item.product.stock_quantity) {
      return { success: false, error: 'Insufficient stock' };
    }
    item.quantity = quantity;
    saveCartToStorage(cart);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function getCartItems(): Promise<CartSummary> {
  try {
    const items = getCartFromStorage();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return { items, subtotal, itemCount, totalQuantity };
  } catch (error) {
    return { items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 };
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    saveCartToStorage([]);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Unexpected error occurred' };
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const items = getCartFromStorage();
    return items.length;
  } catch (error) {
    return 0;
  }
}

export async function validateCart(): Promise<{
  isValid: boolean;
  errors: string[];
  updatedItems?: CartItem[];
}> {
  try {
    const { items } = await getCartItems();
    const errors: string[] = [];
    const updatedItems: CartItem[] = [];
    for (const item of items) {
      if (!item.product?.is_active) {
        errors.push(`${item.product?.name} is no longer available`);
        continue;
      }
      if (item.quantity > item.product.stock_quantity) {
        errors.push(`Only ${item.product.stock_quantity} units of ${item.product.name} are available`);
        item.quantity = item.product.stock_quantity;
        updatedItems.push({ ...item });
      }
      if (item.price !== item.product.price) {
        errors.push(`Price of ${item.product.name} has changed from $${item.price} to $${item.product.price}`);
        item.price = item.product.price;
        updatedItems.push({ ...item });
      }
    }
    if (updatedItems.length > 0) {
      let cart = getCartFromStorage();
      for (const updated of updatedItems) {
        const idx = cart.findIndex(i => i.id === updated.id);
        if (idx !== -1) cart[idx] = updated;
      }
      saveCartToStorage(cart);
    }
    return {
      isValid: errors.length === 0,
      errors,
      updatedItems: updatedItems.length > 0 ? updatedItems : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Error validating cart'],
    };
  }
}
