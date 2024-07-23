import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton2';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../lib/firebaseConfig';
import { analytics } from '../../lib/firebaseConfig';
import { useNavigation } from '@react-navigation/native';


const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const auth = FIREBASE_AUTH;
  const router = useRouter();
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('Die Passwörter stimmen nicht überein!');
      // Tracking, wenn die Passwörter nicht übereinstimmen
      if (analytics) {
        analytics.logEvent('signup_error', { 
          error: 'Passwords do not match',
          context: 'Password Validation'
        });
      }
      return;
    }
  
    setIsSubmitting(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert('User erfolgreich erstellt!');
      // Erfolgreiches Registrierungsereignis senden
      if (analytics) {
        analytics.logEvent('signup_success', { 
          method: 'Email',
          userId: response.user.uid
        });
      }
      router.push('/SignIn');
    } catch (error) {
      alert('User konnte nicht erstellt werden');
      // Fehlerereignis senden
      if (analytics) {
        analytics.logEvent('signup_failure', { 
          error: error.message,
          context: 'Firebase Auth'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 }}>
      <View className="w-full justify-center h-full px-4 my-6">
      <TouchableOpacity onPress={() => navigation.navigate('index')}>
        <Image source={images.SoundSpotterLogo} resizeMode='contain' style={{ width: 140, height: 40 }} />
      </TouchableOpacity>

          <Text className="text-xl text-white mt-8 font-psemibold">Registriere dich bei SoundSpotter</Text>
          
          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <View className="relative mt-7">
            <FormField
              title="Passwort"
              value={password}
              handleChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              toggleSecureEntry={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          </View>

          <View className="relative mt-7">
            <FormField
              title="Passwort bestätigen"
              value={confirmPassword}
              handleChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              toggleSecureEntry={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            />
          </View>

          <CustomButton
            title="Registrieren"
            handlePress={handleSignUp}
            containerStyles="mt-12"
            isLoading={isSubmitting}
          />
          <View className="justify-center pt-8 flex-row gap-2 mb-10">
            <Text className="text-lg text-gray-100 font-pregular">
              Account schon vorhanden?
            </Text>
            <Link href="/SignIn" className="text-lg font-psemibold text-secondary">Anmelden</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;