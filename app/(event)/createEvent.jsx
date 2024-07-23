import React, { useState } from 'react';
import { View, Text, ScrollView, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton2';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const CreateEvent = () => {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [genre, setGenre] = useState('');
  const [info, setInfo] = useState('');
  const [location, setLocation] = useState('');
  
  


  const create = async (user) => {
    const db = getFirestore();
    const profileRef = doc(db, 'events', event.uid);
      await setDoc(profileRef, {
        name: user.email,
        photoURL: defaultPhotoUrl,
        createdAt: new Date()
      });
      console.log("Profil erstellt mit Standardbild");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center h-full px-4 my-6">
          <Image source={images.SoundSpotterLogo} resizeMode='contain' className="w-[140px] h-[40px]" />
          <Text className="text-xl text-white mt-8 font-psemibold">Erstelle ein Event</Text>
          <FormField
            title="Name"
            value={name}
            handleChangeText={setName}
            otherStyles="mt-7"
          />
          <FormField
            title="artist"
            value={artist}
            handleChangeText={setArtist}
            otherStyles="mt-7"
          />
          <FormField
            title="date"
            value={date}
            handleChangeText={setDate}
            otherStyles="mt-7"
          />
          <FormField
            title="genre"
            value={genre}
            handleChangeText={setGenre}
            otherStyles="mt-7"
          />
          <FormField
            title="info"
            value={genre}
            handleChangeText={setInfo}
            otherStyles="mt-7"
          />
          <FormField
            title="location"
            value={genre}
            handleChangeText={setLocation}
            otherStyles="mt-7"
          />
          <CustomButton
            title="Erstellen"
            handlePress={create}
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


