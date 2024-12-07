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

// Main application component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state
  const [isAdmin, setIsAdmin] = useState(false); // Admin role state
  const [userId, setUserId] = useState(null); // User ID state
  const [token, setToken] = useState(null); // Token state

  // Handles user logout by clearing state + local storage
  const handleLogout = async () => {
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('token'); // Removes token from storage
    await AsyncStorage.removeItem('role'); // Removes role from storage
  };

  // Stack for authentication screens
  const AuthStackScreen = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            setIsLoggedIn={setIsLoggedIn} // Update login state
            setIsAdmin={setIsAdmin} // Update admin state
            setUserId={setUserId} // Set user ID
            setToken={setToken} // Set token
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Registration" component={RegistrationScreen} />
    </AuthStack.Navigator>
  );

  // Tab navigator for regular users
  const UserTabsScreen = () => (
    <MainTabs.Navigator
      initialRouteName="HOME"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#e0e0e0' }, // Tab bar styling
        tabBarActiveTintColor: '#007AFF', // Active tab color
        tabBarInactiveTintColor: '#333', // Inactive tab color
      }}
    >
      <MainTabs.Screen name="PROFILE" component={ProfileStackScreen} />
      <MainTabs.Screen name="HOME">
        {(props) => (
          <UserHomeScreen
            {...props}
            handleLogout={handleLogout} // Logout function
            userId={userId} // Pass the user ID
            token={token} // Pass the token
          />
        )}
      </MainTabs.Screen>
      <MainTabs.Screen name="MENU" component={UserMenuScreen} />
    </MainTabs.Navigator>
  );

  // Stack navigator for user profile-related screens
  const ProfileStackScreen = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} />
      <ProfileStack.Screen name="UpdateDetails" component={UserUpdateDetailsScreen} />
    </ProfileStack.Navigator>
  );

  // Stack navigator for admin-specific screens
  const AdminStackScreen = () => (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminHomeScreen">
        {(props) => (
          <AdminHomeScreen
            {...props}
            handleLogout={handleLogout} // Logout function
          />
        )}
      </AdminStack.Screen>
      <AdminStack.Screen name="PointManagementScreen" component={AdminPointManagementScreen} />
    </AdminStack.Navigator>
  );

  // Root stack to determine the starting stack based on login +  role state
  const RootStackScreen = () => (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? ( // If logged in
        isAdmin ? ( // Check if user is an admin
          <RootStack.Screen name="AdminStack" component={AdminStackScreen} />
        ) : (
          <RootStack.Screen name="UserTabs" component={UserTabsScreen} />
        )
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackScreen} /> // Show auth screens if not logged in
      )}
    </RootStack.Navigator>
  );

  // Navigation container wrapping the root stack
  return <NavigationContainer>{RootStackScreen()}</NavigationContainer>;
}
