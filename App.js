import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase, seedData } from './src/core/db';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        await seedData();
      } catch (e) {
        console.error("DB setup failed", e);
      } finally {
        setIsDbReady(true);
      }
    }
    setup();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0F5' }}>
        <ActivityIndicator size="large" color="#FF9EBB" />
      </View>
    );
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
