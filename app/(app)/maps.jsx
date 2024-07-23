import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_DB } from './../../lib/firebaseConfig';

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

const Maps = () => {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('alle');

  const navigation = useNavigation();

  useEffect(() => {
    const initializeLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    initializeLocation();

    const eventsRef = collection(FIREBASE_DB, 'events');
    const unsubscribe = onSnapshot(eventsRef, (querySnapshot) => {
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        if (data.location && data.location.latitude && data.location.longitude) {
          return {
            ...data,
            id: doc.id,
            coords: { latitude: data.location.latitude, longitude: data.location.longitude }
          };
        }
        return null; // Falls das Event keine gültigen Koordinaten hat, wird es ignoriert
      }).filter(event => event !== null); // Filtere alle null-Events raus
      
      const currentDate = new Date();
      const upcomingEvents = eventsData.filter(event => event.date.seconds + 18000 > currentDate.getTime() / 1000);

      setEvents(upcomingEvents);
      setFilteredEvents(upcomingEvents); // FilteredEvents wird aktualisiert, wenn die Events sich ändern
    });

    return () => unsubscribe();  // Cleanup der Subscriptions
  }, []);

  useEffect(() => {
    const searchQueryLower = searchQuery.toLowerCase();
    const foundEvents = events.filter(event =>
      event.name.toLowerCase().includes(searchQueryLower)
    );
    setFilteredEvents(foundEvents);
  }, [searchQuery, events]);

  const navigateToEvent = () => {
    if (selectedEvent && selectedEvent.coords) {
      const { latitude, longitude } = selectedEvent.coords;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredEvents(events);
  };

  const getEventMarkerColor = (eventName) => {
    const event = events.find(event => event.name === eventName);
    if (event) {
      const genre = genres.find(genre => genre.value === event.genre);
      return genre ? getEventGenreColorNew(genre.value) : '#ffffff';
    }
    return '#ffffff';
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

  const handleDetailsPress = (event) => {
    setSelectedEvent(null);
    navigation.navigate('(event)/eventDetail', { eventDetail: event });
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return { date: `${day}.${month}.${year}`, time: `${hours}:${minutes}` };
    }
    return { date: 'Datum nicht verfügbar', time: '' };
  };

  const filterEventsByDay = (dayOffset) => {
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date.seconds * 1000);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      return eventDate.getDate() === targetDate.getDate() &&
             eventDate.getMonth() === targetDate.getMonth() &&
             eventDate.getFullYear() === targetDate.getFullYear();
    });
    setFilteredEvents(filtered);
  };

  const changeFilterAlle = () => {
    setFilteredEvents(events);
    setFilter("alle");
  };

  const changeFilterHeute = () => {
    filterEventsByDay(0);
    setFilter("heute");
  };

  const changeFilterMorgen = () => {
    filterEventsByDay(1);
    setFilter("morgen");
  };

  const changeFilterÜbermorgen = () => {
    filterEventsByDay(2);
    setFilter("übermorgen");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentPosition ? currentPosition.latitude : 52.5426,
            longitude: currentPosition ? currentPosition.longitude : 13.3490,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
        >
          {filteredEvents.map(event => (
            <Marker
              key={event.id}
              coordinate={event.coords}
              title={event.name}
              description={`Standort des ${event.name}`}
              pinColor={getEventMarkerColor(event.name)}
              onPress={() => setSelectedEvent(event)}
            />
          ))}
        </MapView>
        
        {selectedEvent && (
          <>
          <View style={styles.overlay}></View>
            <View style={styles.eventPopup}>
              
              <Text style={styles.eventName}>{selectedEvent.name}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
                <Text style={styles.closeButtonText}>x</Text>
              </TouchableOpacity>

              <Text style={styles.eventDetail}>Artist: {selectedEvent.artist}</Text>              
              <Text style={styles.eventDetail}>Datum: {formatDate(selectedEvent.date).date}</Text>
              <Text style={styles.eventDetail}>Beginn: {formatDate(selectedEvent.date).time} Uhr</Text>

              
              <View style={[styles.genreButton, { backgroundColor: getEventGenreColorNew(selectedEvent.genre) }]}>
                <Text style={styles.genreButtonText}>{selectedEvent.genre}</Text>
              </View>

              <TouchableOpacity style={styles.detailsLinkZwei} onPress={() => handleDetailsPress(selectedEvent)}>
                <Text style={styles.detailsLinkText}>Details</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.detailsLink} onPress={navigateToEvent}>
                <Text style={styles.detailsLinkText}>Zur Navigation mit Google Maps</Text>
              </TouchableOpacity>

            </View>
          </>
        )}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Suche nach Event"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSearch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterButtonsContainer}>

            <TouchableOpacity 
              style={filter === 'alle' ? styles.filterButton : styles.filterButtonInactive}
              onPress={changeFilterAlle}
              disabled={filter === 'alle'}
            >
              <Text style={styles.filterButtonText}>Alle Events</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={filter === 'heute' ? styles.filterButton : styles.filterButtonInactive}
              onPress={changeFilterHeute}
              disabled={filter === 'heute'}
            >
              <Text style={styles.filterButtonText}>Heute</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={filter === 'morgen' ? styles.filterButton : styles.filterButtonInactive}
              onPress={changeFilterMorgen}
              disabled={filter === 'morgen'}
            >
              <Text style={styles.filterButtonText}>Morgen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={filter === 'übermorgen' ? styles.filterButton : styles.filterButtonInactive}
              onPress={changeFilterÜbermorgen}
              disabled={filter === 'übermorgen'}
            >
              <Text style={styles.filterButtonText}>Übermorgen</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 9,
    right: 9,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  searchBar: {
    flex: 1,
    height: 50,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: '#aaa',
  },
  zoomButton: {
    backgroundColor: "#f07151",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  eventPopup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 3,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventDetail: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailsLink: {
    alignSelf: 'flex-end',
  },
  detailsLinkZwei: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  detailsLinkText: {
    color: '#f07151',
    fontSize: 16,
    marginRight: 11,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  closeButtonText: {
    color: '#f07151',
    fontSize: 20,
    fontWeight: 'bold',
  },
  genreButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  genreButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  filterButtonsContainer: {
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButtonInactive: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 10,
  },
  filterButton: {
    backgroundColor: '#f07151',
    padding: 10,
    borderRadius: 10,
  },
  filterButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 13,
    paddingLeft: 1,
    paddingRight: 1,
  },
});

export default Maps;
