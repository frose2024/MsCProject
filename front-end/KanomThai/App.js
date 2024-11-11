import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import UserUpdateDetailsScreen from './screens/UserUpdateDetailsScreen';
import UserHomeScreen from './screens/UserHomeScreen';
import UserMenuScreen from './screens/UserMenuScreen';
import AdminQRScreen from './screens/AdminQRScreen';
import AdminMenuScreen from './screens/AdminMenuScreen';

const AuthStack = createStackNavigator();
const MainTabs = createBottomTabNavigator();
const RootStack = createStackNavigator();
const ProfileStack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogout = async () => {
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
  };

  // Authentication Stack
  const AuthStackScreen = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            setIsLoggedIn={setIsLoggedIn}
            setIsAdmin={setIsAdmin}
            setUserId={setUserId}
            setToken={setToken}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Registration" component={RegistrationScreen} />
    </AuthStack.Navigator>
  );

  // Profile Stack with UpdateDetailsScreen
  const ProfileStackScreen = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} />
      <ProfileStack.Screen name="UpdateDetails" component={UserUpdateDetailsScreen} />
    </ProfileStack.Navigator>
  );

  // Main Tabs Screen
  const MainTabsScreen = () => (
    <MainTabs.Navigator
      initialRouteName="HOME"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#e0e0e0' },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#333',
      }}
    >
      {isAdmin ? (
        <>
          <MainTabs.Screen name="QR SCANNER" component={AdminQRScreen} />
          <MainTabs.Screen name="MENU MANAGEMENT" component={AdminMenuScreen} />
        </>
      ) : (
        <>
          <MainTabs.Screen name="PROFILE" component={ProfileStackScreen} />
          <MainTabs.Screen name="HOME">
            {(props) => (
              <UserHomeScreen
                {...props}
                handleLogout={handleLogout}
                userId={userId}   // Pass userId here
                token={token}      // Pass token here
              />
            )}
          </MainTabs.Screen>
          <MainTabs.Screen name="MENU" component={UserMenuScreen} />
        </>
      )}
    </MainTabs.Navigator>
  );

  // Root Stack: Conditionally renders AuthStack or MainTabs
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <RootStack.Screen name="MainTabs" component={MainTabsScreen} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
