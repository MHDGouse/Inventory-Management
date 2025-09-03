'use client';

import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback } from 'react';

// Define app state structure
interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  user: any | null;
  cart: any[];
  // Add other global state properties here
}

// Define action types
type ActionType = 
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_USER'; payload: any | null }
  | { type: 'ADD_TO_CART'; payload: any }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState: AppState = {
  theme: 'light',
  sidebarOpen: false,
  user: null,
  cart: [],
};

// Create context
const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<ActionType>;
  // Add action creators here
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setUser: (user: any | null) => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
} | undefined>(undefined);

// Reducer function
function reducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_TO_CART':
      return { 
        ...state, 
        cart: [...state.cart, action.payload] 
      };
    case 'REMOVE_FROM_CART':
      return { 
        ...state, 
        cart: state.cart.filter(item => item.id !== action.payload) 
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Action creators
  const toggleTheme = useCallback(() => {
    dispatch({ 
      type: 'SET_THEME', 
      payload: state.theme === 'light' ? 'dark' : 'light' 
    });
  }, [state.theme]);
  
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);
  
  const setUser = useCallback((user: any | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);
  
  const addToCart = useCallback((item: any) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  }, []);
  
  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const value = {
    state,
    dispatch,
    toggleTheme,
    toggleSidebar,
    setUser,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
