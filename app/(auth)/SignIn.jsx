import React, { useState } from 'react';
import { View, Text, ScrollView, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import CustomButton from '../../components/CustomButton2'
import { TouchableOpacity } from 'react-native';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const auth = getAuth();
  const navigation = useNavigation();

  const getDefaultPhotoUrl = async () => {
    const storage = getStorage();
    const pathReference = ref(storage, 'ProfilDefault.png');
    return await getDownloadURL(pathReference);
  };

  const createOrUpdateProfile = async (user) => {
    const db = getFirestore();
    const profileRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      const defaultPhotoUrl = await getDefaultPhotoUrl();
      const userName = user.email.substring(0, user.email.indexOf('@')); // Extract name from email
      await setDoc(profileRef, {
        name: userName,
        email: user.email,
        photoURL: defaultPhotoUrl,
        createdAt: new Date(),
        genres: [], 
        artist: false 
      });
      console.log("Profil erstellt mit Standardbild");
    } else {
      console.log("Profil bereits vorhanden");
    }
  };
  

  const handleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      await createOrUpdateProfile(response.user);
      navigation.navigate('(app)', { screen: 'Karte' });
    } catch (error) {
      console.error('Fehler bei der Anmeldung:', error);
      alert('Es existiert kein Account mit diesen Anmeldedaten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center h-full px-4 my-6">
        <TouchableOpacity onPress={() => navigation.navigate('index')}>
          <Image source={images.SoundSpotterLogo} resizeMode='contain' style={{ width: 140, height: 40 }} />
        </TouchableOpacity>

          <Text className="text-xl text-white mt-8 font-psemibold">Melde dich bei SoundSpotter an</Text>
          <FormField
            title="Email"
            value={email}
            handleChangeText={setEmail}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <FormField
            title="Passwort"
            value={password}
            handleChangeText={setPassword}
            otherStyles="mt-7"
            secureTextEntry={!isPasswordVisible}
            toggleSecureEntry={() => setIsPasswordVisible(!isPasswordVisible)}
          />
          <CustomButton
            title="Anmelden"
            handlePress={handleSignIn}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          <View className="justify-center pt-5 flew-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Noch kein Account?
            </Text>
            <Link href="/SignUp" className="text-lg font-psemibold text-secondary">Registieren</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
