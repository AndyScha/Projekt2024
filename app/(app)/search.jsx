import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl, FlatList, StyleSheet, TouchableOpacity, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, getDocs } from 'firebase/firestore';
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

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsersAndEvents, setAllUsersAndEvents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchType, setSearchType] = useState('events');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigation = useNavigation();
  let viewRef;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userQuery = query(collection(FIREBASE_DB, 'users'));
      const userQuerySnapshot = await getDocs(userQuery);

      const users = userQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'user',
        name: doc.data().name || doc.data().email,
        ...doc.data()
      })).filter(user => user.artist);

      const eventQuery = query(collection(FIREBASE_DB, 'events'));
      const eventQuerySnapshot = await getDocs(eventQuery);
      const events = eventQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'event',
        ...doc.data()
      }));

      const currentDate = new Date();
      const upcomingEvents = events.filter(event => event.date.seconds + 18000 > currentDate.getTime() / 1000);

      const combinedData = [...users, ...upcomingEvents];
      setAllUsersAndEvents(combinedData);
    } catch (error) {
      console.error('Error fetching data: ', error);
      Alert.alert('Fehler', 'Fehler beim Abrufen der Daten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    const filterData = (query, data) => {
      if (query === '') {
        return data;
      } else {
        return data.filter(item =>
          item.name && item.name.toLowerCase().includes(query.toLowerCase()) // neu
        );
      }
    };
// neu
    const filteredData = filterData(searchQuery, allUsersAndEvents).sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });

    setFilteredData(filteredData);
  }, [searchQuery, allUsersAndEvents]);

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredData(allUsersAndEvents);
  };

  const viewProfile = (item) => {
    if (item.type === 'user') {
      navigation.navigate('createrProf', { userId: item.id });
    } else if (item.type === 'event') {
      setSelectedEvent(item);
      navigation.navigate('(event)/eventDetail', { eventDetail: item });
    }
  };

  const getEventGenreColor = (eventGenre) => {
    const genre = genres.find(genre => genre.value === eventGenre);
    if (genre) {
      const hexColor = genre.color;
      const rgbaColor = hexToRgba(hexColor, 0.5);
      return rgbaColor;
    }
    return 'rgba(255, 255, 255, 0.2)';
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const changeSearchType = () => {
    setSearchType(prevType => (prevType === 'users' ? 'events' : 'users'));
  };

  const placeholderText = searchType === 'users' ? 'Suche nach Artists' : 'Suche nach Events';

  const filteredSearchResults = filteredData.filter(item => {
    if (searchType === 'all') return true;
    return searchType === 'users' ? item.type === 'user' : item.type === 'event';
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder={placeholderText}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, searchType === 'users' ? styles.activeButton : null]}
            onPress={() => changeSearchType('users')}
            disabled={searchType === 'users'}
          >
            <Text style={styles.buttonText}>Artists</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, searchType === 'events' ? styles.activeButton : null]}
            onPress={() => changeSearchType('events')}
            disabled={searchType === 'events'}
          >
            <Text style={styles.buttonText}>Events</Text>
          </TouchableOpacity>
        </View>
      </View>
      {filteredSearchResults.length > 0 ? (
        <View
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f07151"/>      }
        >
          <FlatList
            contentContainerStyle={styles.listContainer}
            data={filteredSearchResults}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.itemContainer,
                  {
                    backgroundColor: getEventGenreColor(item.genre),
                  },
                ]}
                onPress={() => viewProfile(item)}
              >
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : searchQuery.length > 0 ? ( searchType === 'users' ? 
        (<Text style={styles.noResultsText}>Artist nicht gefunden</Text>) : 
        (<Text style={styles.noResultsText}>Event nicht gefunden</Text>)
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 65,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#f07151',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  searchContainer: {
    paddingTop: StatusBar.currentHeight + 60 || 20,
    paddingHorizontal: 10,
    backgroundColor: '#161622',
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
    color: '#1E1E2D',
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
  },
  noResultsText: {
    padding: 20,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default Search;
