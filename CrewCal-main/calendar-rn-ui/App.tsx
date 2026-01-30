import "react-native-gesture-handler";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/auth/AuthContext";
import AppNavigator from "./src/AppNavigator";
import { CalendarProvider } from "./src/calendar/CalendarContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CalendarProvider>
          <AppNavigator />
        </CalendarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
