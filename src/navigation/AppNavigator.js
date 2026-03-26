// @shared navigation/AppNavigator.js — Main Route Registry
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Screens
import LoginScreen from '../features/auth/screens/LoginScreen';
import HomeScreen from '../features/catalog/screens/HomeScreen';
import CategoryListScreen from '../features/catalog/screens/CategoryListScreen';
import ProductListScreen from '../features/catalog/screens/ProductListScreen';
import ProductDetailScreen from '../features/catalog/screens/ProductDetailScreen';
import CartScreen from '../features/cart/screens/CartScreen';
import InvoiceListScreen from '../features/invoice/screens/InvoiceListScreen';
import InvoiceDetailScreen from '../features/invoice/screens/InvoiceDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          borderRadius: 35,
          position: 'absolute',
          bottom: 25,
          left: 15,
          right: 15,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.light,
        tabBarLabelStyle: { fontSize: 11, fontWeight: 'bold' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Categories') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Invoices') iconName = focused ? 'receipt' : 'receipt-outline';
          return <Ionicons name={iconName} size={size + 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Categories" component={CategoryListScreen} options={{ title: 'Danh mục' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
      <Tab.Screen name="Invoices" component={InvoiceListScreen} options={{ title: 'Lịch sử' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProductList" component={ProductListScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
