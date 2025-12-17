import { createContext, useContext, useReducer } from 'react';

// Initial application state
const initialState = {
  boards: [],
  columns: [],
  cards: [],
  activeBoard: null,
  loading: false,
  error: null
};

// Action types
export const ActionTypes = {
  // Board actions
  CREATE_BOARD: 'CREATE_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  DELETE_BOARD: 'DELETE_BOARD',
  SET_ACTIVE_BOARD: 'SET_ACTIVE_BOARD',
  
  // Column actions
  CREATE_COLUMN: 'CREATE_COLUMN',
  UPDATE_COLUMN: 'UPDATE_COLUMN',
  DELETE_COLUMN: 'DELETE_COLUMN',
  
  // Card actions
  CREATE_CARD: 'CREATE_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  
  // UI state
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_ACTIVE_BOARD:
      return { ...state, activeBoard: action.payload };
    
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    // TODO: Implement board, column, and card action handlers
    default:
      return state;
  }
};

// Create contexts
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// PUBLIC_INTERFACE
/**
 * Provider component for application state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// PUBLIC_INTERFACE
/**
 * Hook to access application state
 * @returns {Object} Current application state
 */
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

// PUBLIC_INTERFACE
/**
 * Hook to access dispatch function
 * @returns {Function} Dispatch function for state updates
 */
export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within AppStateProvider');
  }
  return context;
};
