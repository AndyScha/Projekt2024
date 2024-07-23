import { View, Text } from 'react-native'
import {Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';


const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="SignIn" options={{headerShown: false,gestureEnabled: false }}/>
        <Stack.Screen name="SignUp" options={{headerShown: false,gestureEnabled: false }}/>
      </Stack>

      <StatusBar backgroundColor='#161622' style="light"/>
    </>
  )
}

export default AuthLayout