import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SectionList, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { temp } from './genreTile';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from '../../lib/firebaseConfig';
import { icons } from '../../constants';
import { useNavigation } from '@react-navigation/native';

export let detail = "";

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

const EventsByGenre = () => {
  const genre = temp;
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(FIREBASE_DB, 'events'),
        where('genre', '==', genre)
      );
      const querySnapshot = await getDocs(q);
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });

      const currentDate = new Date();
      const upcomingEvents = events.filter(event => event.date.seconds + 18000 > currentDate.getTime() / 1000);

      upcomingEvents.sort((a, b) => a.date.seconds - b.date.seconds);
      setFilteredData(upcomingEvents);
    };

    fetchData();
  }, [genre]);

  const handlePress = (item) => {
    setSelectedEvent(item);
    navigation.navigate('(event)/eventDetail', { eventDetail: item });
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

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Function to render date section header
  const renderDateSectionHeader = ({ section }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{formatDate(section.date)}</Text>
      </View>
    );
  };

  // Group events by date
  const groupedData = filteredData.reduce((acc, item) => {
    const dateKey = formatDate(item.date);
    if (!acc[dateKey]) {
      acc[dateKey] = { date: item.date, data: [] };
    }
    acc[dateKey].data.push(item);
    return acc;
  }, {});

  // Transform groupedData into array format expected by SectionList
  const sections = Object.keys(groupedData).map(date => ({
    date: groupedData[date].date,
    data: groupedData[date].data,
  }));

  return (
    <View style={styles.container}>
        <Link href="/genre" style={styles.back}>←</Link>
        <Text style={styles.itemInfo}></Text>
        <Text style={styles.title}>{genre} Events</Text>
      <ScrollView>
        {filteredData.length != 0 ? (
          <SectionList
           scrollEnabled={false} // neu
            contentContainerStyle={styles.listContainer}
            sections={sections}
            keyExtractor={(item, index) => item.id + '_' + index}
            renderSectionHeader={renderDateSectionHeader}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemContainer}
                onPress={() => handlePress(item)}
              >
                <View style={[styles.infoItem, { backgroundColor: getEventGenreColor(item.genre) }]}>
                  <View style={styles.iconContainer}>
                    <Image source={icons.event} style={styles.iconStyle} />
                  </View>
                  <Text style={styles.itemTime}>
                    <Text style={styles.itemText}>{item.name}</Text>{'\n'}
                    <Text style={styles.itemInfo}>Artist: {item.artist}</Text>{'\n'}
                    <Text style={styles.itemInfo}>Beginn: {formatTime(item.date)} Uhr</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noEventsText}>Momentan keine Events vorhanden</Text>
        )}
      </ScrollView>
    </View>
  );
};

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

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight + 60 || 20,
    flex: 1,
    padding: 10,
    backgroundColor: '#161622',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 15,
  },
  back: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 10,
    paddingHorizontal: 5,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  itemText: {
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 2,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 24,
  },
  itemTime: {
    paddingLeft: 30,
    fontSize: 14,
    color: '#fff',
  },
  itemInfo: {
    paddingLeft: 10,
    fontSize: 14,
    color: '#fff',
  },
  sectionHeader: {
    backgroundColor: '#222235',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    marginTop: 15,
    borderRadius: 5,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 8,
  },
  iconContainer: {
    width: 60,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
  },
  iconStyle: {
    width: 25,
    height: 25,
    tintColor: '#ffffff',
    marginLeft: 24,
  },
  noEventsText: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 35,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

export default EventsByGenre;
