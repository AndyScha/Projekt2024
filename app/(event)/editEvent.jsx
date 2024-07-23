import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, FlatList, Platform, Dimensions, Alert, Modal } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { getAuth } from 'firebase/auth';
import { doc, addDoc, getDoc, getFirestore, collection, where, query, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Timestamp } from 'firebase/firestore';
import axios from 'axios';
import { router } from 'expo-router';
//import { event } from '../(app)/profil';
import { useRoute, useNavigation } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

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
  const route = useRoute();
  const { event } = route.params;
  let eventId = event.id;
  const db = getFirestore();
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState(new Date());
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
  const [street, setStreet] = useState(''); //neu
  const [suggestions, setSuggestions] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [changed, setChanged] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const profileDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(profileDoc);

        if (docSnap.exists()) {
          setArtist(docSnap.data().name);
        } else {
          console.log('Kein Profil gefunden. Weiterleitung...');
        }
      }
    };

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

    fetchProfile();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchEventData(eventId);
    }
  }, [eventId]);

  const fetchEventData = async (eventId) => {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setName(eventData.name);
        setArtist(eventData.artist);
        setDate(eventData.date.toDate());
        setSelectedGenre(eventData.genre);
        setInfo(eventData.info);
        setRegion({
          ...region,
          latitude: eventData.location.latitude,
          longitude: eventData.location.longitude,
        });
        setMarker({
          latitude: eventData.location.latitude,
          longitude: eventData.location.longitude,
        });
        setAddress(eventData.location.address);
        setStreet(eventData.location.street); // neu
      } else {
        console.log('Event-Dokument nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Events: ', error);
    }
  };

  const onMapPress = (e) => {
    setMarker({
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude
    });
    reverseGeocode(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
    setChanged(true);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      let response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
      setAddress(response.data.display_name);
      setStreet(response.data.address?.road || '');  // Hier die Straße extrahieren
    } catch (error) {
      console.error('Fehler bei der Adresssuche: ', error);
      setAddress('');
      setStreet(''); // neu
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
    setChanged(true);
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

  const validateInputs = () => {
    return name && artist && date && selectedGenre && marker && info;
  };

  const deleteEvent = async () => {
    try {
      if (eventId) {
        const eventDoc = doc(db, 'events', eventId); // Correctly reference the event document
        await deleteDoc(eventDoc);
        router.push('../(app)/settings');
        setDeleteModal(false);
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error);
    }
  };

  const updateEvent = async () => {
    if (!eventId) {
      alert('Event ID fehlt.');
      return;
    }

    if (!validateInputs()) {
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
    }

    try {
      const eventDoc = doc(db, 'events', eventId); // Event-Dokument referenzieren
      await updateDoc(eventDoc, {
        name,
        artist,
        genre: selectedGenre,
        date: Timestamp.fromDate(date),
        location: {
          address,
          street, // neu
          latitude: marker.latitude,
          longitude: marker.longitude,
        },
        info
      });
      alert('Event erfolgreich aktualisiert!');
      router.push('../(app)/settings');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Events: ', error);
      alert('Fehler beim Aktualisieren des Events. Bitte versuchen Sie es erneut.');
    }
  };
  
  const abbrechen = async () => {
    try {
      navigation.navigate('Profil')    
    } catch (error) {
      alert('Fehler beim Aktualisieren des Events. Bitte versuchen Sie es erneut.');
    }
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

  const formatDateWithoutSeconds = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString('de-DE', options);
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
        onPress={() => {toggleGenre(genre.value); setChanged(true);}}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.messageBox}>
          <Text style={styles.screenTitle}>Bearbeite dein Event</Text>
          <Text style={styles.text}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Event benennen"
              placeholderTextColor={'gray'}
              style={styles.inputField}
              value={name}
              onChangeText={(text) => { 
                setName(text);
                setChanged(true);
              }}
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
                  onChangeText={(text) => { 
                    handleAddressChange(text);
                    setChanged(true);
                  }}
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
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder="Event beschreiben"
                    placeholderTextColor={'gray'}
                    style={[styles.inputField, { height: 150, textAlignVertical: 'top', paddingTop: 13}]}
                    value={info}
                    onChangeText={(text) => { 
                      setInfo(text);
                      setChanged(true);
                    }}
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
            <TouchableOpacity style={[styles.createButton, { opacity: (changed) ? 1 : 0.4 }]} onPress={updateEvent} disabled={!changed}>
              <Text style={styles.createButtonText}>Aktualisieren</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={() => setDeleteModal(true)}>
              <Text style={styles.createButtonText}>Löschen</Text>
            </TouchableOpacity>

        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={deleteModal}
          onRequestClose={() => setDeleteModal(false)}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Möchtest Du das Event wirklich löschen?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={deleteEvent}
              >
                <Text style={styles.deleteButtonText}>Löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setDeleteModal(false)}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  abbrechenButton: {
    backgroundColor: '#3C3C47',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f07151',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 5,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
});

export default Create;

