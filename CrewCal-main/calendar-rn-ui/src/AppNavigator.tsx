import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CalendarDrawerContent from "./components/CalendarDrawerContent";
import { useAuth } from "./auth/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import CalendarScreen from "./screens/CalendarScreen";

export type RootStackParamList = {
  Login: undefined;
  AppDrawer: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CalendarDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: "front", drawerStyle: { width: 300 } }}
    >
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthed } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthed ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="AppDrawer" component={AppDrawer} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
