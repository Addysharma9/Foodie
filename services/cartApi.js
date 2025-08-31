const baseURL = 'http://212.38.94.189:8000';

export const cartApi = {
  // Get user cart
  getUserCart: async (appUserId) => {
    try {
      console.log('Fetching cart for user:', appUserId);
      const response = await fetch(`${baseURL}/api/user/${appUserId}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseText = await response.text();
      console.log('Raw cart response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse cart response:', parseError);
        return { cart_items: [] };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { cart_items: [] };
    }
  },

  // Get product details
  getProduct: async (productId) => {
    try {
      const response = await fetch(`${baseURL}/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Rest of your methods remain the same...
  addToCart: async (appUserId, productId, quantity) => {
    try {
      console.log('Adding to cart:', { appUserId, productId, quantity });
      const response = await fetch(`${baseURL}/api/user/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_user_id: appUserId,
          product_id: productId,
          quantity: quantity,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (cartId, quantity, appUserId) => {
    try {
      const response = await fetch(`${baseURL}/api/user/cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: quantity,
          app_user_id: appUserId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (cartId, appUserId) => {
    try {
      const response = await fetch(`${baseURL}/api/user/cart/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_user_id: appUserId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  clearUserCart: async (appUserId) => {
    try {
      const response = await fetch(`${baseURL}/api/user/${appUserId}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};
