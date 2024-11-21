import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';

import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import UserUpdateDetailsScreen from './screens/UserUpdateDetailsScreen';
import UserHomeScreen from './screens/UserHomeScreen';
import UserMenuScreen from './screens/UserMenuScreen';
import AdminHomeScreen from './screens/AdminHomeScreen';
import AdminPointManagementScreen from './screens/AdminPointManagementScreen';

const AuthStack = createStackNavigator();
const MainTabs = createBottomTabNavigator();
const RootStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const AdminStack = createStackNavigator();

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

  // User Navigator (For regular users)
  const UserTabsScreen = () => (
    <MainTabs.Navigator
      initialRouteName="HOME"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#e0e0e0' },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#333',
      }}
    >
      <MainTabs.Screen name="PROFILE" component={ProfileStackScreen} />
      <MainTabs.Screen name="HOME">
        {(props) => (
          <UserHomeScreen
            {...props}
            handleLogout={handleLogout}
            userId={userId}
            token={token}
          />
        )}
      </MainTabs.Screen>
      <MainTabs.Screen name="MENU" component={UserMenuScreen} />
    </MainTabs.Navigator>
  );

  const ProfileStackScreen = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} />
      <ProfileStack.Screen name="UpdateDetails" component={UserUpdateDetailsScreen} />
    </ProfileStack.Navigator>
  );
  
  const AdminStackScreen = () => (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminHomeScreen">
        {(props) => (
          <AdminHomeScreen
            {...props}
            handleLogout={handleLogout}
          />
        )}
      </AdminStack.Screen>
      <AdminStack.Screen name="PointManagementScreen" component={AdminPointManagementScreen} />
    </AdminStack.Navigator>
  );

  const RootStackScreen = () => (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        isAdmin ? (
          <RootStack.Screen name="AdminStack" component={AdminStackScreen} />
        ) : (
          <RootStack.Screen name="UserTabs" component={UserTabsScreen} />
        )
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
      )}
    </RootStack.Navigator>
  );

  return <NavigationContainer>{RootStackScreen()}</NavigationContainer>;
}
