// @shared context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@movie/session_user';

const initialState = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':       return { ...state, user: action.payload, isLoggedIn: true, isLoading: false };
    case 'LOGOUT':      return { ...state, user: null, isLoggedIn: false };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    default:            return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) dispatch({ type: 'LOGIN', payload: JSON.parse(raw) });
      else dispatch({ type: 'SET_LOADING', payload: false });
    });
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

// Action helpers
export const loginAction    = (user)   => ({ type: 'LOGIN',  payload: user });
export const logoutAction   = ()       => ({ type: 'LOGOUT' });
