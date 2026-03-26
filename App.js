import React, { useEffect } from 'react';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, seedData } from './src/core/db';

export default function App() {
  useEffect(() => {
    initDatabase().then(seedData);
  }, []);
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
