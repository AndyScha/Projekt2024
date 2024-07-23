import React from 'react';
import { View, Text, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Genre from '../(app)/genre';
import Search from '../(app)/search'; 
import Create from '../(app)/create';
import Maps from '../(app)/maps';
import Profile from '../(app)/profil';
import Settings from '../(app)/settings';
import { icons } from '../../constants';
import Registrieren from '../(auth)/SignUp'
import Anmelden from '../(auth)/SignIn'
import CreaterProf from './createrProf';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const ProfileStack2 = createStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfilMain" component={Profile} options={{ headerShown: false,gestureEnabled: false }}/>
      <ProfileStack.Screen name="Settings" component={Settings} options={{ headerShown: false,gestureEnabled: false }} />
      <ProfileStack.Screen name="Erstellen" component={Create} options={{ headerShown: false,gestureEnabled: false }} />
      <ProfileStack.Screen name="SignUp" component={Registrieren} options={{ headerShown: false,gestureEnabled: false }} />
      <ProfileStack.Screen name="SignIn" component={Anmelden} options={{ headerShown: false,gestureEnabled: false }} />
    </ProfileStack.Navigator>
  );
};

const ProfileStackNavigator2 = () => {
  return (
    <ProfileStack2.Navigator>
      <ProfileStack2.Screen name="SucheMain" component={Search} options={{ headerShown: false,gestureEnabled: false }} />
      <ProfileStack2.Screen name="createrProf" component={CreaterProf} options={{ headerShown: false,gestureEnabled: false }}/>
      </ProfileStack2.Navigator>
  );
};

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color, width: 20, height: 20, marginBottom: 2 }}
      />
      <Text style={{ color: focused ? color : '#aaa', fontSize: 12 }}>
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#f07151',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { backgroundColor: '#161622' },
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          switch (route.name) {
            case 'Suche': iconName = icons.search; break;
            case 'Genre': iconName = icons.genre; break;
            case 'Erstellen': iconName = icons.plus; break;
            case 'Karte': iconName = icons.maps; break;
            case 'Profil': iconName = icons.profile; break;
            default: break;
          }
          return <TabIcon icon={iconName} color={color} name={route.name} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Suche" component={ProfileStackNavigator2} options={{ headerShown: false,gestureEnabled: false }} />
      <Tab.Screen name="Genre" component={Genre} options={{ headerShown: false,gestureEnabled: false }} />
      <Tab.Screen name="Erstellen" component={Create} options={{ headerShown: false,gestureEnabled: false }} />
      <Tab.Screen name="Karte" component={Maps} options={{ headerShown: false,gestureEnabled: false }} />
      <Tab.Screen name="Profil" component={ProfileStackNavigator} options={{ headerShown: false, gestureEnabled: false}} />
    </Tab.Navigator>
  );
};
export default TabsLayout;