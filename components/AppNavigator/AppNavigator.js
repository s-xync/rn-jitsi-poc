import React, { Component } from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import FirstScreen from "../../screens/FirstScreen/FirstScreen";
import ClassScreen from "../../screens/ClassScreen/ClassScreen";

const Stack = createStackNavigator();

class AppNavigator extends Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator headerMode="none">
          <Stack.Screen name="FirstScreen" component={FirstScreen} />
          <Stack.Screen name="ClassScreen" component={ClassScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default AppNavigator;
