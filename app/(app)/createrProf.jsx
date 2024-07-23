import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; 
import { icons } from '../../constants';

const CreaterProf = ({ route, navigation }) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePressSpotify = () => {
    Linking.openURL(profile.spotify);
  };

  const handlePressApple = () => {
    Linking.openURL(profile.apple);
  };

  const handlePressSoundcloud = () => {
    Linking.openURL(profile.soundcloud);
  };

  const handleDetailsPress = (event) => {
    navigation.navigate('(event)/eventDetail', { eventDetail: event });
  };

  const fetchProfile = async () => {
    const db = getFirestore();
    try {
      // Fetch user profile
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setProfile(profileData);

        // Fetch events by artist name
        const eventsQuery = query(collection(db, 'events'), where('artist', '==', profileData.name));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const currentDate = new Date();
        const upcomingEvents = eventsList.filter(event => event.date.seconds + 18000 > currentDate.getTime() / 1000);

      setEvents(upcomingEvents);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile().then(() => setRefreshing(false));
  };

  const getGenreColorWithOpacity = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.noProfil}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f07151" />}
      >
        <View style={styles.messageBox}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.screenTitle}>{profile.name}</Text>
          </View>
          <View style={styles.profileSection}>
            {profile.photoURL && (
              <Image
                source={{ uri: profile.photoURL }}
                style={styles.image}
                onError={(e) => console.log('Error loading image:', e)}
              />
            )}
            <View>
              <Text style={styles.artistText}>{profile.artist ? "Artist" : "Fan"}</Text>
              <Text style={profile.email.length > 15 ? styles.smallMailText : styles.mailText}>{profile.email}</Text>
            </View>
          </View>

          {(profile.spotify || profile.apple || profile.soundcloud) && profile.artist ? (

            <View>
              <Text style={styles.textSmall}></Text>

              <Text style={styles.text}>Streame {profile.name}s Musik</Text>

              <View style={styles.streaming}>

              {profile.spotify ? (

                <TouchableOpacity onPress={handlePressSpotify}>
                  <Image source={icons.spotify} style={styles.iconStyle} />
                </TouchableOpacity>

              ) : (
                <View></View>
              )}

              {profile.apple ? (

              <TouchableOpacity onPress={handlePressApple}>
                <Image source={icons.apple} style={styles.iconStyle} />
              </TouchableOpacity>

              ) : (
              <View></View>
              )}

              {profile.soundcloud ? (

              <TouchableOpacity onPress={handlePressSoundcloud}>
                <Image source={icons.soundcloud} style={styles.iconStyle} />
              </TouchableOpacity>

              ) : (
              <View></View>
              )}

              </View>

              <Text style={styles.text}></Text>
              <Text style={styles.text}></Text>

            </View>

            ) : (          

            <Text style={styles.textsuperSmall}></Text>

        )}

          <Text style={styles.text}>{"Genres"}</Text>
          {(!Array.isArray(profile.genres) || profile.genres.length === 0) && (
            <Text style={styles.keinText}>keine Genres angegeben</Text>
          )}

          {Array.isArray(profile.genres) && profile.genres.length > 0 && (
            <View style={styles.genreContainer}>
              {profile.genres
                .slice()
                .sort((a, b) => a.localeCompare(b))
                .map((genre) => {
                  const genreObj = genres.find(g => g.value === genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      disabled={true}
                      style={[
                        styles.genreButton,
                        {
                          backgroundColor: getGenreColorWithOpacity(genreObj?.color, 0.5) || '#696969',
                        },
                      ]}
                >
                  <Text style={[styles.genreText, { color: '#FFFFFF' }]}>{genre}</Text>
                </TouchableOpacity>
                  );
            })}
            </View>
          )}

          {profile.artist && (
            <View>
              <Text style={styles.text}></Text>
              <Text style={styles.text}>Bevorstehende Events</Text>
              {events.length === 0 && <Text style={styles.keinText}>aktuell keine bevorstehenden Events</Text>}
              <FlatList
                data={events.sort((a, b) => a.date.seconds - b.date.seconds)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                  style={[styles.eventTile, { backgroundColor: getGenreColorWithOpacity(genres.find(genre => genre.value === item.genre)?.color, 0.5) || '#333' }]}
                  onPress={() => handleDetailsPress(item)}
                  >
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        </View>
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
    alignItems: 'center',
    backgroundColor: '#161622',
    paddingVertical: 30,
  },
  messageBox: {
    width: '90%',
    backgroundColor: '#161622',
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  screenTitle: {
    fontSize: 25,
    color: '#f07151',
    textAlign: 'left',
    marginBottom: 30,
    marginTop: 15,
  },
  settingsIcon: {
    width: 23,
    height: 23,
    tintColor: '#f07151',
    marginBottom: 30,
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 40,
    marginLeft: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  artistText: {
    fontSize: 18,
    color: '#f07151',
    textAlign: 'left',
    marginBottom: 7,
    fontWeight: 'bold',
    marginLeft: 40,
  },
  mailText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    marginLeft: 40,
  },
  smallMailText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'left',
    marginLeft: 40,
  },
  text: {
    fontSize: 16,
    color: '#f07151',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingBottom: 15,
  },
  textSmall: {
    fontSize: 10,
  },
  iconStyle: {
    width: 45,
    height: 45,
    marginLeft: 10,
    marginRight: 15,
    marginTop: 5, 
    borderRadius: 10,   
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genreButton: {
    paddingHorizontal: 14,
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 12,
    marginVertical: 5,
    alignItems: 'center',
  },
  genreText: {
    fontSize: 14,
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
  },
  eventName: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventDate: {
    color: 'white',
    marginTop: 5,
  },
  editIconContainer: {
    position: 'absolute',
    top: 17,
    right: 17,
  },
  vergangeneText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'left',
  },
  noProfil: {
    flex: 1,
    backgroundColor: '#161622',
    alignItems: 'center',
  },
  streaming: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    top: 10,
    height: 40, 
    width: 40, 
    borderRadius: 20, 
    marginBottom: 10,
  },
  backButtonText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
  },
});

export default CreaterProf;
