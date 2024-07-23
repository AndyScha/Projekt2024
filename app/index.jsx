import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { images } from '../constants';
import CustomButton from '../components/CustomButton2';

export default function App() {
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full items-center mt-20">
          <Image
            source={images.SoundSpotterLogo}
            className="w-[400px] h-[100px]"
            resizeMode='contain'
          />
        </View>

        <View className="w-full justify-center items-center flex-1 px-4 mt-0">
          <View className="relative mt-0">
            <Text className="text-xl text-white font-pbold text-center">
              Deine Musik, Dein Spot!
            </Text>
          </View>

          <CustomButton
            title="Anmelden"
            handlePress={() => router.push('/../(auth)/SignIn')}
            containerStyles="w-full mt-7"
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              oder
            </Text>
          </View>

          <CustomButton
            title="Registrieren"
            handlePress={() => router.push('/../(auth)/SignUp')}
            containerStyles="w-full mt-7"
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Nur reinschauen?
            </Text>
            <Link href="/(app)/maps" className="text-lg font-psemibold text-secondary">Als Gast fortfahren</Link>
          </View>

        </View>

      </ScrollView>

      <StatusBar backgroundColor='#161622' style='dark' />
    </SafeAreaView>
  );
}
