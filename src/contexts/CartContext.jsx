import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { orderAPI } from '../services/api';

// Create the Cart Context
const CartContext = createContext();

// Action types
const actionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  SET_CART: 'SET_CART',
  UPDATE_ITEM_ARTICLE_STATUS: 'UPDATE_ITEM_ARTICLE_STATUS',
  UPDATE_ITEM_PAYMENT_STATUS: 'UPDATE_ITEM_PAYMENT_STATUS',
  UPDATE_ITEM_OPTIONS: 'UPDATE_ITEM_OPTIONS',
  LOAD_CART_FROM_SERVER: 'LOAD_CART_FROM_SERVER'
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoaded: false
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_CART:
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // If item exists, update it
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          ...action.payload
        };
      } else {
        // If item doesn't exist, add it
        // Initialize article and payment status
        const newItem = {
          ...action.payload,
          articleSubmitted: false,
          paymentCompleted: false,
          sensitiveTopic: false,
          homepageAnnouncement: false,
          copywritingPrice: action.payload.copywritingPrice || 0,
          homepageAnnouncementPrice: action.payload.homepageAnnouncementPrice || 0,
          sensitiveContentExtraCharge: action.payload.sensitiveContentExtraCharge || 0,
          anchorText: action.payload.anchorText || '', // Add anchorText field
          targetUrl: action.payload.targetUrl || '' // Add targetUrl field
          // Remove orderId field - let backend generate it
        };
        updatedItems = [...state.items, newItem];
      }
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
        totalPrice: updatedItems.reduce((total, item) => {
          // Calculate total including base price and additional options
          const basePrice = item.price || 0;
          const sensitiveTopicPrice = (item.sensitiveTopic && item.sensitiveContentExtraCharge) || 0;
          const homepageAnnouncementPrice = (item.homepageAnnouncement && item.homepageAnnouncementPrice) || 0;
          const copywritingPrice = (item.articleType === 'publisher' && item.copywritingPrice) || 0;
          return total + basePrice + sensitiveTopicPrice + homepageAnnouncementPrice + copywritingPrice;
        }, 0)
      };
      
    case actionTypes.REMOVE_FROM_CART:
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.length,
        totalPrice: filteredItems.reduce((total, item) => {
          // Calculate total including base price and additional options
          const basePrice = item.price || 0;
          const sensitiveTopicPrice = (item.sensitiveTopic && item.sensitiveContentExtraCharge) || 0;
          const homepageAnnouncementPrice = (item.homepageAnnouncement && item.homepageAnnouncementPrice) || 0;
          const copywritingPrice = (item.articleType === 'publisher' && item.copywritingPrice) || 0;
          return total + basePrice + sensitiveTopicPrice + homepageAnnouncementPrice + copywritingPrice;
        }, 0)
      };
      
    case actionTypes.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
      
    case actionTypes.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.items ? action.payload.items.length : 0,
        totalPrice: action.payload.items ? action.payload.items.reduce((total, item) => {
          // Calculate total including base price and additional options
          const basePrice = item.price || 0;
          const sensitiveTopicPrice = (item.sensitiveTopic && item.sensitiveContentExtraCharge) || 0;
          const homepageAnnouncementPrice = (item.homepageAnnouncement && item.homepageAnnouncementPrice) || 0;
          const copywritingPrice = (item.articleType === 'publisher' && item.copywritingPrice) || 0;
          return total + basePrice + sensitiveTopicPrice + homepageAnnouncementPrice + copywritingPrice;
        }, 0) : 0
      };
      
    case actionTypes.LOAD_CART_FROM_SERVER:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.items ? action.payload.items.length : 0,
        totalPrice: action.payload.items ? action.payload.items.reduce((total, item) => {
          // Calculate total including base price and additional options
          const basePrice = item.price || 0;
          const sensitiveTopicPrice = (item.sensitiveTopic && item.sensitiveContentExtraCharge) || 0;
          const homepageAnnouncementPrice = (item.homepageAnnouncement && item.homepageAnnouncementPrice) || 0;
          const copywritingPrice = (item.articleType === 'publisher' && item.copywritingPrice) || 0;
          return total + basePrice + sensitiveTopicPrice + homepageAnnouncementPrice + copywritingPrice;
        }, 0) : 0,
        isLoaded: true
      };
      
    case actionTypes.UPDATE_ITEM_ARTICLE_STATUS:
      const updatedItemsWithArticleStatus = state.items.map(item => {
        if (item.id === action.payload.itemId) {
          return {
            ...item,
            articleSubmitted: true,
            articleType: action.payload.articleType, // 'publisher' or 'own'
            ...action.payload.additionalData
          };
        }
        return item;
      });
      
      // Recalculate total price
      const newTotalPrice = updatedItemsWithArticleStatus.reduce((total, item) => {
        const basePrice = item.price || 0;
        const sensitiveTopicPrice = (item.sensitiveTopic && item.sensitiveContentExtraCharge) || 0;
        const homepageAnnouncementPrice = (item.homepageAnnouncement && item.homepageAnnouncementPrice) || 0;
        const copywritingPrice = (item.articleType === 'publisher' && item.copywritingPrice) || 0;
        return total + basePrice + sensitiveTopicPrice + homepageAnnouncementPrice + copywritingPrice;
      }, 0);
      
      return {
        ...state,
        items: updatedItemsWithArticleStatus,
        totalPrice: newTotalPrice
      };
      
    case actionTypes.UPDATE_ITEM_PAYMENT_STATUS:
      const updatedItemsWithPaymentStatus = state.items.map(item => {
        if (item.id === action.payload.itemId) {
          return {
            ...item,
            paymentCompleted: action.payload.paymentCompleted
          };
        }
        return item;
      });
      
      return {
        ...state,
        items: updatedItemsWithPaymentStatus
      };
      
    case actionTypes.UPDATE_ITEM_OPTIONS:
      const updatedItemsWithOptions = state.items.map(item => {
        if (item.id === action.payload.itemId) {
          return {
            ...item,
            ...action.payload.options
          };
        }
        return item;
      });
      
      // Recalculate total price
      const updatedTotalPrice = updatedItemsWithOptions.reduce((total, item) => {
        const basePrice = item.price || 0;
        const sensitiveTopicPrice = (item.sensitiveTopic && item.sensitiveContentExtraCharge) || 0;
        const homepageAnnouncementPrice = (item.homepageAnnouncement && item.homepageAnnouncementPrice) || 0;
        const copywritingPrice = (item.articleType === 'publisher' && item.copywritingPrice) || 0;
        return total + basePrice + sensitiveTopicPrice + homepageAnnouncementPrice + copywritingPrice;
      }, 0);
      
      return {
        ...state,
        items: updatedItemsWithOptions,
        totalPrice: updatedTotalPrice
      };

    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Initially return empty state, will load from server
    return initialState;
  });

  // Load cart from server when component mounts
  useEffect(() => {
    loadCartFromServer();
  }, []);

  // Save cart to server whenever it changes (with debounce)
  useEffect(() => {
    if (state.isLoaded) {
      const timer = setTimeout(() => {
        saveCartToServer(state);
      }, 1000); // Debounce by 1 second
      
      return () => clearTimeout(timer);
    }
  }, [state, state.isLoaded]);

  // Load cart from server
  const loadCartFromServer = async () => {
    try {
      // In a real implementation, this would fetch the cart from the server
      // For now, we'll load from localStorage as fallback
      const savedCart = localStorage.getItem('advertiserCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: actionTypes.LOAD_CART_FROM_SERVER, payload: parsedCart });
      } else {
        dispatch({ type: actionTypes.LOAD_CART_FROM_SERVER, payload: { items: [] } });
      }
    } catch (error) {
      console.error('Failed to load cart from server:', error);
      // Fallback to localStorage
      try {
        const savedCart = localStorage.getItem('advertiserCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: actionTypes.LOAD_CART_FROM_SERVER, payload: parsedCart });
        } else {
          dispatch({ type: actionTypes.LOAD_CART_FROM_SERVER, payload: { items: [] } });
        }
      } catch (localStorageError) {
        console.error('Failed to load cart from localStorage:', localStorageError);
        dispatch({ type: actionTypes.LOAD_CART_FROM_SERVER, payload: { items: [] } });
      }
    }
  };

  // Save cart to server
  const saveCartToServer = async (cartState) => {
    try {
      // In a real implementation, this would save the cart to the server
      // For now, we'll save to localStorage
      localStorage.setItem('advertiserCart', JSON.stringify(cartState));
      
      // If you want to implement server saving, you would do something like:
      // await orderAPI.saveCart(cartState);
    } catch (error) {
      console.error('Failed to save cart to server:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem('advertiserCart', JSON.stringify(cartState));
      } catch (localStorageError) {
        console.error('Failed to save cart to localStorage:', localStorageError);
      }
    }
  };

  // Save article data to server
  const saveArticleData = async (itemId, articleData) => {
    try {
      // Find the item in the cart
      const item = state.items.find(item => item.id === itemId || item.orderId === itemId);
      if (item) {
        // If the item already has an orderId, save the article data to the server immediately
        if (item.orderId) {
          await orderAPI.saveArticleData(item.orderId, articleData);
        } else {
          // If the item doesn't have an orderId yet, store the article data in the cart
          // It will be saved to the server when the order is created
          dispatch({
            type: actionTypes.UPDATE_ITEM_ARTICLE_STATUS,
            payload: {
              itemId: item.id,
              articleType: item.articleType || 'own',
              additionalData: { articleData }
            }
          });
        }
      } else {
        // If item is not found in cart, it might be a direct order ID
        // Try to save directly to server
        try {
          await orderAPI.saveArticleData(itemId, articleData);
        } catch (error) {
          console.error('Failed to save article data to server:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to save article data to server:', error);
      throw error;
    }
  };

  // Action creators
  const addToCart = (item) => {
    // Add anchorText and targetUrl if not already present, but don't generate orderId here
    const itemWithDefaults = {
      ...item,
      anchorText: item.anchorText || 'Example Anchor Text',
      targetUrl: item.targetUrl || 'https://example.com',
      articleRequirements: item.articleRequirements || ''
      // Remove orderId generation - let backend generate it
    };
    dispatch({ type: actionTypes.ADD_TO_CART, payload: itemWithDefaults });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: actionTypes.CLEAR_CART });
  };

  const setCart = (cartData) => {
    dispatch({ type: actionTypes.SET_CART, payload: cartData });
  };

  const updateItemArticleStatus = (itemId, articleType, additionalData = {}) => {
    dispatch({ type: actionTypes.UPDATE_ITEM_ARTICLE_STATUS, payload: { itemId, articleType, additionalData } });
  };

  const updateItemPaymentStatus = (itemId, paymentCompleted) => {
    dispatch({ type: actionTypes.UPDATE_ITEM_PAYMENT_STATUS, payload: { itemId, paymentCompleted } });
  };

  const updateItemOptions = (itemId, options) => {
    dispatch({ type: actionTypes.UPDATE_ITEM_OPTIONS, payload: { itemId, options } });
  };

  // Context value
  const value = {
    cart: state,
    addToCart,
    removeFromCart,
    clearCart,
    setCart,
    updateItemArticleStatus,
    updateItemPaymentStatus,
    updateItemOptions,
    saveArticleData
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;