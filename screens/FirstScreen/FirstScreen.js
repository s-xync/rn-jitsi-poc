import React, { Component } from "react";
import { Button, View, Text } from "react-native";

class FirstScreen extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>First Screen</Text>
        <Button
          onPress={() => this.props.navigation.navigate("ClassScreen")}
          title="Go to Class Screen"
        />
      </View>
    );
  }
}

export default FirstScreen;
