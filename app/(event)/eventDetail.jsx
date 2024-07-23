import React, { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { icons } from '../../constants';
import { View, Text, StyleSheet, StatusBar, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const EventDetail = () => {
  const route = useRoute();
  const { eventDetail } = route.params;
  const navigation = useNavigation();

  const [region, setRegion] = useState({
    latitude: eventDetail.location.latitude,
    longitude: eventDetail.location.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
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

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const dateObj = new Date(timestamp.seconds * 1000);
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      const weekday = getWeekday(dateObj.getDay());
      return `${weekday}, ${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
    }
    return 'Datum nicht verfügbar';
  };

  const formatTime = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const dateObj = new Date(timestamp.seconds * 1000);
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }
    return 'Uhrzeit nicht verfügbar';
  };

  const getWeekday = (dayIndex) => {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[dayIndex];
  };

  const getEventGenreColor = (eventGenre) => {
    const genre = genres.find(genre => genre.value === eventGenre);
    if (genre) {
      const hexColor = genre.color;
      const rgbaColor = hexToRgba(hexColor, 0.5);
      return rgbaColor;
    }
    return 'rgba(0, 0, 0, 0.35)'; // Default to semi-transparent black if genre color not found
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

  if (!eventDetail) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Event Details</Text>
        <Text style={styles.errorText}>Event Details konnten nicht geladen werden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      

      <View style={styles.mapContainer}>
            <MapView
              style={styles.mapStyle}
              region={region}
              zoomEnabled={true}
              scrollEnabled={true}
            >
              <Marker 
                coordinate={eventDetail.location}
                pinColor={getEventGenreColorNew(eventDetail.genre)}
                />
            </MapView>
      </View>

      <Text style={styles.title}>{eventDetail.name || 'Nicht verfügbar'}</Text>

      <View style={styles.infoWrapper}>
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: getEventGenreColor(eventDetail.genre ) }]}>
            <Image source={icons.musician} style={styles.iconStyle} />
          </View>
          <Text style={styles.infoText}>{eventDetail.artist || 'Nicht verfügbar'}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: getEventGenreColor(eventDetail.genre) }]}>
            <Image source={icons.calender} style={styles.iconStyle} />
          </View>
          <Text style={styles.infoTextDate}>{formatDate(eventDetail.date)} {'\n'}ab {formatTime(eventDetail.date)} Uhr</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: getEventGenreColor(eventDetail.genre) }]}>
            <Image source={icons.music} style={styles.iconStyleMusic} />
          </View>
          <Text style={styles.infoText}>{eventDetail.genre || 'Nicht verfügbar'}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={[styles.iconContainer, { backgroundColor: getEventGenreColor(eventDetail.genre) }]}>
            <Image source={icons.location} style={styles.iconStyleLoc} />
          </View>
          <View>
            {formatText(eventDetail.location.address  || 'Nicht verfügbar')}
          </View>
        </View>
      </View>

      <Text style={styles.itemContainerOben}>Beschreibung:</Text>
      <Text style={styles.itemContainerUnten}>{eventDetail.info || 'Keine Beschreibung verfügbar - Lass dich überraschen'}</Text>
    </ScrollView>
  );
};

const formatText = (text) => {
  const parts = text.split(',');
  const filteredParts = parts.filter(word => word.trim() !== 'Deutschland');

  let lines = [];
  let currentLine = '';

  filteredParts.forEach((part, index) => {
    const words = part.trim().split(' ');
    words.forEach((word, wordIndex) => {
      if ((currentLine + word).length > 30) {
        lines.push(currentLine.trim());
        currentLine = '';
      }

      if (wordIndex === words.length - 1) {
        currentLine += word.trim();
      } else {
        currentLine += word.trim() + ' ';
      }
    });

    if (index !== filteredParts.length - 1) {
      currentLine += ', '; 
    }
  });

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.map((line, index) => (
    <Text key={index} style={styles.infoText}>{line}</Text>
  ));
};


const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight + 50 || 10,
    flex: 1,
    padding: 10,
    backgroundColor: '#161622',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#ffffff',
    paddingHorizontal: 10,
  },
  back: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 10,
  },
  infoWrapper: {
    marginVertical: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 35,
  },
  infoTextDate: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 35,
    lineHeight: 24,
  },
  itemContainerOben: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  itemContainerUnten: {
    padding: 10,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 150,
  },
  mapContainer: {
    marginTop: 40,
    marginBottom: 40,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  mapStyle: {
    width: '100%',
    height: 200,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
  },
  iconStyle: {
    width: 25,
    height: 25,
    tintColor: '#ffffff',
    marginLeft: 17,
  },
  iconStyleLoc: {
    width: 33,
    height: 33,
    tintColor: '#ffffff',
    marginLeft: 13,
  },
  iconStyleMusic: {
    width: 25,
    height: 25,
    tintColor: '#ffffff',
    marginLeft: 15,
  },
  iconContainer: {
    width: 60,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  backButton: {
    top: 10,
    left: 10, 
    zIndex: 1, 
    height: 40, 
    width: 40, 
    borderRadius: 20, 
},
backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
},
});
  
export default EventDetail;