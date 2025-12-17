import { createContext, useContext, useReducer, useEffect } from 'react';
import { initIndexedDB } from '../utils/storage';
import * as boardActions from './boards';
import * as columnActions from './columns';
import * as cardActions from './cards';

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
  SET_BOARDS: 'SET_BOARDS',
  ADD_BOARD: 'ADD_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  DELETE_BOARD: 'DELETE_BOARD',
  SET_ACTIVE_BOARD: 'SET_ACTIVE_BOARD',
  
  // Column actions
  SET_COLUMNS: 'SET_COLUMNS',
  ADD_COLUMN: 'ADD_COLUMN',
  UPDATE_COLUMN: 'UPDATE_COLUMN',
  DELETE_COLUMN: 'DELETE_COLUMN',
  
  // Card actions
  SET_CARDS: 'SET_CARDS',
  ADD_CARD: 'ADD_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  
  // UI state
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_BOARDS:
      return { ...state, boards: action.payload };
    
    case ActionTypes.ADD_BOARD:
      return { ...state, boards: [...state.boards, action.payload] };
    
    case ActionTypes.UPDATE_BOARD:
      return {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload } : b
        )
      };
    
    case ActionTypes.DELETE_BOARD:
      return {
        ...state,
        boards: state.boards.filter(b => b.id !== action.payload),
        activeBoard: state.activeBoard === action.payload ? null : state.activeBoard
      };
    
    case ActionTypes.SET_ACTIVE_BOARD:
      return { ...state, activeBoard: action.payload };
    
    case ActionTypes.SET_COLUMNS:
      return { ...state, columns: action.payload };
    
    case ActionTypes.ADD_COLUMN:
      return { ...state, columns: [...state.columns, action.payload] };
    
    case ActionTypes.UPDATE_COLUMN:
      return {
        ...state,
        columns: state.columns.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      };
    
    case ActionTypes.DELETE_COLUMN:
      return {
        ...state,
        columns: state.columns.filter(c => c.id !== action.payload)
      };
    
    case ActionTypes.SET_CARDS:
      return { ...state, cards: action.payload };
    
    case ActionTypes.ADD_CARD:
      return { ...state, cards: [...state.cards, action.payload] };
    
    case ActionTypes.UPDATE_CARD:
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      };
    
    case ActionTypes.DELETE_CARD:
      return {
        ...state,
        cards: state.cards.filter(c => c.id !== action.payload)
      };
    
    case ActionTypes.MOVE_CARD:
      return {
        ...state,
        cards: state.cards.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      };
    
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
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

  // Initialize IndexedDB on mount
  useEffect(() => {
    const init = async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      try {
        await initIndexedDB();
        
        // Load initial data
        const boards = await boardActions.loadBoards();
        dispatch({ type: ActionTypes.SET_BOARDS, payload: boards });
        
        // Set first board as active if exists
        if (boards.length > 0 && !state.activeBoard) {
          dispatch({ type: ActionTypes.SET_ACTIVE_BOARD, payload: boards[0].id });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };
    
    init();
  }, []);

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

// Export action creators for convenience
export { boardActions, columnActions, cardActions };
