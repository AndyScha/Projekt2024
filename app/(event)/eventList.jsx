import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, SafeAreaView, FlatList, RefreshControl, Alert } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

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

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            await fetchPastEvents(user.uid);
        }
    });

    return () => unsubscribe();
  }, []);

  const fetchPastEvents = async (uid) => {
    try {
      const now = new Date();
      const eventsQuery = query(collection(db, 'events'), where('creatorId', '==', uid));
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => new Date((event.date.seconds + 18000) * 1000 ) < now);
      setEvents(eventsData);
      console.log('Fetched past events:', eventsData); // Debugging log
    } catch (error) {
      console.error('Error fetching past events:', error);
      Alert.alert('Fehler', 'Fehler beim Abrufen der Daten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
    }
  };

  const onRefresh = async () => {
    const user = auth.currentUser;
    if (user) {
      setRefreshing(true);
      await fetchPastEvents(user.uid);
      setRefreshing(false);
    }
  };

  const handleDetailsPress = (event) => {
    navigation.navigate('(event)/eventDetail', { eventDetail: event });
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const dateObj = new Date(timestamp.seconds * 1000);
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
    }
    return 'Datum nicht verfügbar';
  };

  const getGenreColorWithOpacity = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderHeader = () => (
    <View style={styles.fixedHeader}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.screenTitle}>Deine vergangenen Events</Text>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.messageBox}>
      <Text style={styles.keinText}>keine vergangenen Events vorhanden</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        data={events.sort((a, b) => a.date.seconds - b.date.seconds)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.eventTile, { backgroundColor: getGenreColorWithOpacity(genres.find(genre => genre.value === item.genre)?.color, 0.5) || '#333' }]}
            onPress={() => handleDetailsPress(item)}
          >
            <Text style={styles.eventName}>{item.name}</Text>
            <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f07151" />}
        contentContainerStyle={events.length === 0 ? styles.centeredContainer : undefined}
      />
      
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
    alignItems: 'center',
    backgroundColor: '#161622',
    paddingBottom: 30,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 10,
    backgroundColor: '#161622',
  },
  messageBox: {
    width: '90%',
    backgroundColor: '#161622',
    borderRadius: 10,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 25,
    color: '#f07151',
    textAlign: 'left',
    marginBottom: 30,
    marginTop: 25,
  },
  keinText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
  },
  eventTile: {
    padding: 10,
    marginBottom: 10,
    marginTop: 8,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    width: '90%', // Set the width of eventTile to be smaller
    alignSelf: 'center', //
  },
  eventName: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventDate: {
    color: 'white',
    marginTop: 5,
  },
  backButton: {
    top: 10,
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

export default EventList;
