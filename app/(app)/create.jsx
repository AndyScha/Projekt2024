import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, FlatList, Dimensions, Alert } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { getAuth } from 'firebase/auth';
import { doc, addDoc, getDoc, getFirestore, collection, where, query, getDocs, Timestamp } from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import settings from '../../assets/icons/einstellungen.png';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';

const windowWidth = Dimensions.get('window').width;

const getNextFullHour = () => {
  const now = new Date();
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  if (now.getMinutes() > 0) {
    now.setHours(now.getHours() + 1);
  }
  return now;
};

const genres = [
  { key: '1', value: 'Acoustic', color: '#E01F1F' },
  { key: '2', value: 'Alternative', color: '#92B649' },
  { key: '3', value: 'Blues', color: '#7644BB' },
  { key: '4', value: 'Chor', color: '#1F14EB' },
  { key: '5', value: 'Classical', color: '#4BB452' },
  { key: '6', value: 'Country', color: '#BA9545' },
  { key: '7', value: 'Dance', color: '#4497BB' },
  { key: '8', value: 'Disco', color: '#18E7BD' },
  { key: '9', value: 'Drum and Bass', color: '#6AB649' },
  { key: '10', value: 'EDM', color: '#C912ED' },
  { key: '11', value: 'Electronic', color: '#A85798' },
  { key: '12', value: 'Experimental', color: '#ACAD52' },
  { key: '13', value: 'Folk', color: '#8012ED' },
  { key: '14', value: 'Funk', color: '#18E772' },
  { key: '15', value: 'Hard Rock', color: '#AB5454' },
  { key: '16', value: 'Hardstyle', color: '#42B3BD' },
  { key: '17', value: 'Heavy Metal', color: '#446CBB' },
  { key: '18', value: 'Hip Hop', color: '#F2AA0D' },
  { key: '19', value: 'House', color: '#11ACEE' },
  { key: '20', value: 'Indie', color: '#E61A7C' },
  { key: '21', value: 'Jazz', color: '#CBCD32' },
  { key: '22', value: 'K-Pop', color: '#5ADD22' },
  { key: '23', value: 'Latin', color: '#4A44BB' },
  { key: '24', value: 'Metal', color: '#BD6B42' },
  { key: '25', value: 'Orchester', color: '#4BB479' },
  { key: '26', value: 'Pop', color: '#11DCEE' },
  { key: '27', value: 'Punk', color: '#145CEB' },
  { key: '28', value: 'RnB', color: '#22DD2F' },
  { key: '29', value: 'Reggae', color: '#A0E01F' },
  { key: '30', value: 'Reggaeton', color: '#9B57A8' },
  { key: '31', value: 'Rock', color: '#E61ABD' },
  { key: '32', value: 'Soul', color: '#42BDA4' },
  { key: '33', value: 'Techno', color: '#F2590D' },
  { key: '34', value: 'Trance', color: '#9E617E' },
];

const Create = () => {
  const db = getFirestore();
  const auth = getAuth();
  const [isArtist, setIsArtist] = useState(false);
  const [isFan, setIsFan] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(getNextFullHour());
  const [selectedGenre, setSelectedGenre] = useState('');
  const [info, setInfo] = useState('');
  const [region, setRegion] = useState({
    latitude: 52.5200,
    longitude: 13.4050,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [artistName, setArtistName] = useState('');

  const navigation = useNavigation();


  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {

      console.log('isArtist:', isArtist);
      console.log('isFan:', isFan);

      if (user) {
        console.log('User is logged in:', user);
        const profileDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(profileDoc);
        if (docSnap.exists()) {
          console.log('User document:', docSnap.data());
          setIsArtist(docSnap.data().artist === true);
          setArtistName(docSnap.data().name);
          setIsFan(docSnap.data().artist === false);
        } else {
          console.log('No such document!');
        }
      } else {
        console.log('No user logged in');
      }
    });

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const onMapPress = (e) => {
    setMarker({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude
    });
    reverseGeocode(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      let response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
      setAddress(response.data.display_name);
      setStreet(response.data.address?.road || '');
    } catch (error) {
      console.error('Fehler bei der Adresssuche: ', error);
      setAddress('');
      setStreet('');
    }
  };

  const fetchAddressSuggestions = async (query) => {
    if (query.length > 0) {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5&countrycodes=de`);
      setSuggestions(response.data);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddressChange = (text) => {
    setAddress(text);
    fetchAddressSuggestions(text);
  };

  const handleSuggestionPress = (suggestion) => {
    setAddress(suggestion.display_name);
    setMarker({
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    });
    setRegion({
      ...region,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });
    setSuggestions([]);
  };

  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const handleCreateEvent = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Anmeldung erforderlich', 'Bitte melde dich an, um ein Event zu erstellen.');
      return;
    }

    const profileDoc = doc(db, 'users', user.uid);
    const docSnap = await getDoc(profileDoc);
    if (!docSnap.exists() || !docSnap.data().artist) {
      Alert.alert('Nicht berechtigt', 'Du musst als Künstler angemeldet sein, um Events erstellen zu können.');
      return;
    }

    if (!name) {
      alert('Bitte gib deinem Event einen passenden Namen.');
      return;
    }

    if (name.length > 25) {
      alert('Der Name deines Events darf maximal 25 Zeichen lang sein.');
      return;
    }

    if (!selectedGenre) {
      alert('Bitte wähle ein Genre für dein Event aus.');
      return;
    }

    if (!date) {
      alert('Bitte wähle Datum und Uhrzeit für dein Event aus.');
      return;
    }

    if (!marker) {
      alert('Bitte gib eine Adresse für dein Event an oder markiere den Ort auf der Map.');
      return;
    }

    if (!info) {
      alert('Bitte gib eine Beschreibung deines Events an.');
      return;
    }

    try {
      const eventQuery = query(collection(db, 'events'), where('location.address', '==', address), where('date', '==', Timestamp.fromDate(date)));
      const eventQuerySnapshot = await getDocs(eventQuery);

      if (!eventQuerySnapshot.empty) {
        Alert.alert(
          'Event existiert bereits',
          'Bitte wähle einen anderen Ort oder ein anderes Datum für dein Event, da dieser Ort und Zeitpunkt bereits belegt sind.',
          [{ text: 'OK' }]
        );
        return;
      }

      await addDoc(collection(db, 'events'), {
        name,
        genre: selectedGenre,
        date: Timestamp.fromDate(date),
        location: {
          address,
          street,
          latitude: marker.latitude,
          longitude: marker.longitude,
        },
        info,
        artist: artistName, // Use the artist name from the user profile
        creatorId: user.uid,  // Add the user ID of the creator
      });

      alert('Event erfolgreich erstellt!');
      setName('');
      setSelectedGenre('');
      setDate(getNextFullHour());
      setAddress('');
      setInfo('');
      setMarker(null);
      setSuggestions([]);
      
      navigation.navigate( 'Karte' ); 

    } catch (error) {
      console.error('Fehler beim Erstellen des Events: ', error);
      alert('Fehler beim Erstellen des Events. Bitte versuchen Sie es erneut.');
    }
  };

  const clearAddress = () => {
    setAddress('');
    setSuggestions([]);
  };

  const clearName = () => {
    setName('');
  };

  const clearBeschreibung = () => {
    setInfo('');
  };

  const getEventGenreColorNew = (eventGenre) => {
    const genre = genres.find(genre => genre.value === eventGenre);
    if (genre) {
      const hexColor = genre.color;
      const darkerHexColor = darkenColor(hexColor, 10);
      const rgbaColor = hexToRgba(darkerHexColor, 1);
      return rgbaColor;
    }
    return 'rgba(0, 0, 0, 1)';
  };
  
  const darkenColor = (hexColor, percent) => {
    const rgb = parseInt(hexColor.slice(1), 16);
    
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >>  8) & 0xff;
    let b = (rgb >>  0) & 0xff;
  
    r = Math.round(r * (100 - percent) / 100);
    g = Math.round(g * (100 - percent) / 100);
    b = Math.round(b * (100 - percent) / 100);
  
    const darkerHex = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    return darkerHex;
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderGenres = () => {
    return genres.map((genre) => (
      <TouchableOpacity
        key={genre.key}
        style={[
          styles.genreButton,
          {
            backgroundColor: selectedGenre === genre.value ? getGenreColorWithOpacity(genre.color, 0.5) : '#FFFFFF',
          },
        ]}
        onPress={() => toggleGenre(genre.value)}
      >
        <Text
          style={[
            styles.genreText,
            { color: selectedGenre === genre.value ? '#FFFFFF' : '#000000' },
          ]}
        >
          {genre.value}
        </Text>
      </TouchableOpacity>
    ));
  };

  const toggleGenre = (genre) => {
    if (selectedGenre === genre) {
      setSelectedGenre('');
    } else {
      setSelectedGenre(genre);
    }
  };

  const getGenreColorWithOpacity = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const abbrechen = async () => {
    try {
      setName('');
      setSelectedGenre('');
      setDate(new Date());
      setAddress('');
      setInfo('');
      setMarker(null);
      setSuggestions([]);
  
      navigation.navigate('Karte'); 
    } catch (error) {
      alert('Fehler beim Aktualisieren des Events. Bitte versuchen Sie es erneut.');
    }
  };

  const formatDateWithoutSeconds = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString('de-DE', options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {isArtist ? (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.messageBox}>
            <Text style={styles.screenTitle}>Erstelle dein Event</Text>
            <Text style={styles.text}>Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Event benennen"
                placeholderTextColor={'gray'}
                style={styles.inputField}
                value={name}
                onChangeText={setName}
              />
              {name.length > 0 && (
                <TouchableOpacity
                  onPress={clearName}
                  style={styles.clearButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.text}>Genre</Text>
              <View style={styles.genreContainer}>
                {renderGenres()}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.text}>Datum und Uhrzeit</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
                <Text style={styles.datePickerText}>{formatDateWithoutSeconds(date)}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="datetime"
                onConfirm={handleDateConfirm}
                onCancel={() => setShowDatePicker(false)}
                style={styles}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.text}>Ort</Text>
              <View style={styles.addressContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Adresse eingeben"
                    placeholderTextColor={'gray'}
                    style={styles.inputField}
                    value={address}
                    onChangeText={handleAddressChange}
                  />
                  {address.length > 0 && (
                    <TouchableOpacity
                      onPress={clearAddress}
                      style={styles.clearButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.clearButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <FlatList
                data={suggestions}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                    <Text style={styles.suggestion}>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.place_id.toString()}
                style={styles.suggestionsContainer}
              />
            </View>
            <View style={styles.section}>
              <MapView
                style={styles.mapStyle}
                region={region}
                onPress={onMapPress}
                zoomEnabled={true}
                scrollEnabled={true}
              >
                {marker && <Marker 
                  coordinate={marker} 
                  pinColor={getEventGenreColorNew(selectedGenre)}
                />}
              </MapView>
            </View>
            <View>
              <Text style={styles.text}>Beschreibung</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Event beschreiben"
                    placeholderTextColor={'gray'}
                    style={[styles.inputField, { height: 150, textAlignVertical: 'top', paddingTop: 13}]}
                    value={info}
                    onChangeText={setInfo}
                    multiline={true}
                  />
                  {info.length > 0 && (
                    <TouchableOpacity
                        onPress={clearBeschreibung}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[styles.clearButtonText, {paddingTop: 2}]}>×</Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.abbrechenButton} onPress={abbrechen}>
                <Text style={styles.createButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, { opacity: (name && selectedGenre && date && marker && info) ? 1 : 0.4 }]}
                onPress={handleCreateEvent}
              >
                <Text style={styles.createButtonText}>Erstellen</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      ) : isFan ? (
        <View style={styles.newContainer}>
          <View style={styles.messageBox}>
            <Text style={styles.screenTitle}>Erstelle dein Event</Text>

            <View style={styles.centered}>

              <Text style={styles.textWhite}></Text>

              <Text style={styles.textWhite}>Wechsle zu einem Artist-Profil, um eigene Events zu erstellen.</Text>

              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Image source={settings} style={styles.settingsIcon} />
              </TouchableOpacity>

              <Text style={styles.textWhite}></Text> 
            </View>
            
          </View>
        </View>
      ) : (
        <View style={styles.newContainer}>
          <View style={styles.messageBox}>
            <Text style={styles.screenTitle}>Erstelle dein Event</Text>

            <View style={styles.centered}>

              <Text style={styles.textWhite}>Melde dich bitte in deinem Profil an oder registriere dich in der App, um eigene Events zu erstellen.</Text>
              <Text style={styles.textWhite}></Text>

              <TouchableOpacity style={styles.signInUp} onPress={() => navigation.navigate('index')}>
                <Text style={styles.signInUpText}>Anmelden / Registrieren</Text>
              </TouchableOpacity>

              <Text style={styles.textWhite}></Text> 
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );  
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#161622',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161622',
    paddingVertical: 30,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genreButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 2,
    marginVertical: 2,
    alignItems: 'center',
  },
  genreText: {
    fontSize: 11,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161622',
    marginTop: 80,
  },
  newContainer: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#161622',
    paddingVertical: 30,
  },
  settingsIcon: {
    width: 30,
    height: 30,
    marginTop: 25,
    tintColor: '#f07151',
  },
  messageBox: {
    width: '90%',
    backgroundColor: '#161622',
    borderRadius: 10,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
    width: '100%',
  },
  text: {
    fontSize: 16,
    color: '#f07151',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingBottom: 12,
  },
  textWhite: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    padding: 10,
  }, 
  signInUpText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
  }, 
  inputField: {
    backgroundColor: '#3C3C47',
    color: 'white',
    width: '100%',
    padding: 10,
    paddingLeft: 19,
    paddingRight: 40,
    borderRadius: 10,
    marginBottom: 25,
    borderColor: 'white',
    borderWidth: 1,
    height: 42,
  },
  selectList: {
    borderRadius: 10,
    backgroundColor: '#3C3C47',
    marginBottom: 15,
    borderColor: 'white',
    borderWidth: 1,
    height: 42,
  },
  datePicker: {
    backgroundColor: '#3C3C47',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
    marginBottom: 10,
    borderColor: 'white',
    borderWidth: 1,
    height: 42,
  },
  datePickerText: {
    color: 'white',
  },
  mapStyle: {
    width: '100%',
    height: 300,
    marginBottom: 25,
    borderRadius: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#3C3C47',
    borderRadius: 10,
  },
  suggestion: {
    color: 'white',
  },
  screenTitle: {
    fontSize: 25,
    color: '#f07151',
    textAlign: 'left',
    marginBottom: 30,
    marginTop: 15,
  },
  createButton: {
    backgroundColor: '#f07151',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInUp: {
    backgroundColor: '#f07151',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  clearButton: {
    position: 'absolute',
    right: 25,
    top: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#1E1E2D',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  abbrechenButton: {
    backgroundColor: '#3C3C47',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default Create;