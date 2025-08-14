import type React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import type { User } from "../types";

const Stack = createStackNavigator();

interface AppNavigatorProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  user,
  onLogin,
  onLogout,
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Dashboard">
            {(props) => (
              <DashboardScreen {...props} user={user} onLogout={onLogout} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
