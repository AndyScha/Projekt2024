import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, FlatList, RefreshControl, Alert, Linking, ActivityIndicator } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import settings from '../../assets/icons/einstellungen.png';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { icons } from '../../constants';
import { images } from '../../constants';


export let event = "";

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

const Profile = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchProfileAndEvents(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false); //Auth ist geladen
    });

    return () => unsubscribe();
  }, []);

  const fetchProfileAndEvents = async (uid) => {
    try {
      const profileDoc = doc(db, 'users', uid);
      const docSnap = await getDoc(profileDoc);
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        profileData.genres = profileData.genres.map(genre => genres.find(g => g.key === genre)?.value || genre);
        setProfile(profileData);
        const eventsQuery = query(collection(db, 'events'), where('creatorId', '==', uid));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filtern der bevorstehenden Events
      const currentDate = new Date();
      const upcomingEvents = eventsData.filter(event => event.date.seconds + 18000 > currentDate.getTime() / 1000);

      setEvents(upcomingEvents);
       
       // setEvents(eventsData);
        console.log('Fetched events:', eventsData); // Debugging log
      } else {
        console.log('No profile found');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile or events:', error);
      Alert.alert('Fehler', 'Fehler beim Abrufen der Daten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
    }
  };

  const onRefresh = async () => {
    const user = auth.currentUser;
    if (user) {
      setRefreshing(true);
      await fetchProfileAndEvents(user.uid);
      setRefreshing(false);
    }
  };

  const editEvent = (event) => {
    console.log(event)
    navigation.navigate('(event)/editEvent', { event: event })
    //router.push(`../(event)/editEvent`);
  }

  const getGenreColorWithOpacity = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleDetailsPress = (event) => {
    navigation.navigate('(event)/eventDetail', { eventDetail: event });
  };

  const handleVergangenePress = () => {
    navigation.navigate('(event)/eventList');
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

  const handlePressSpotify = () => {
    Linking.openURL(profile.spotify);
  };

  const handlePressApple = () => {
    Linking.openURL(profile.apple);
  };

  const handlePressSoundcloud = () => {
    Linking.openURL(profile.soundcloud);
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f07151" />
        </View>
      </SafeAreaView>
    );
  }


  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.newContainer}>
            <Image
                source={images.SoundSpotterLogo}
                className="w-[300px] h-[75px]"
                resizeMode='contain'
            />

            <Text style={styles.textWhite}>Melde dich bitte an oder registriere dich in der App, um ein eigenes Profil zu erstellen.</Text>

            <TouchableOpacity style={styles.signInUp} onPress={() => navigation.navigate('index')}>
              <Text style={styles.signInUpText}>Anmelden / Registrieren</Text>
            </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  };

  return ( 
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f07151"/>      }
      >
        <View style={styles.messageBox}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>{profile.name}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Image source={settings} style={styles.settingsIcon} />
            </TouchableOpacity>
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

              <Text style={styles.text}>Deine Musik-Streaming-Dienste</Text>

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

          <Text style={styles.text}>{profile.artist ? "Deine Genres" : "Deine Lieblings-Genres"}</Text>
          {(!Array.isArray(profile.genres) || profile.genres.length === 0) && (
            <Text style={styles.keinText}>noch keine Genres ausgewählt</Text>
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

          {profile.artist ? (

            <View>
              <Text style={styles.text}></Text>

              <Text style={styles.text}>Deine bevorstehenden Events</Text>

              {events.length === 0 && <Text style={styles.keinText}>aktuell keine bevorstehenden Events</Text>}
              

              <FlatList
                data={events.sort((a, b) => a.date.seconds - b.date.seconds)}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.eventTile, { backgroundColor: getGenreColorWithOpacity(genres.find(genre => genre.value === item.genre)?.color, 0.5) || '#333' }]}
                    onPress={() => handleDetailsPress(item)}
                  >
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text style={styles.eventDate}>{formatDate(item.date)}</Text>

                    <TouchableOpacity style={styles.editIconContainer} onPress={() => { event = item; editEvent(item); }}>
                      <MaterialIcons name="edit" size={24} color="white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />

              <Text style={styles.text}></Text>

              {events.length != 0 && <Text style={styles.textSmall}></Text>}

              <Text style={styles.text}>Deine vergangenen Events</Text>

              <TouchableOpacity onPress={() => handleVergangenePress()}>
                  <Text style={styles.vergangeneText}>zu deinen vergangenen Events</Text>
              </TouchableOpacity>
              
            </View>

          ) : (

            <View></View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  textWhite: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    padding: 40,
    marginTop: 30,
    marginBottom: 30,
  }, 
  iconContainer: {
    width: 60,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
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
  screenTitle: {
    fontSize: 25,
    color: '#f07151',
    textAlign: 'left',
    marginBottom: 30,
    marginTop: 15,
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
  keinText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
  },
  smallMailText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'left',
    marginLeft: 40,
  },
  vergangeneText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'left',
  },
  iconStyle: {
    width: 45,
    height: 45,
    marginLeft: 10,
    marginRight: 15,
    marginTop: 5, 
    borderRadius: 10,   
  },
  settingsIcon: {
    width: 23,
    height: 23,
    tintColor: '#f07151',
    marginBottom: 30,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  signInUpText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 40,
    marginLeft: 10,
  },
  streaming: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
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
  noProfil: {
    flex: 1,
    backgroundColor: '#161622',
    alignItems: 'center',
  },
  image2: {
    width: 150,
    height: 150,
    marginBottom: 20,
    marginTop: 100,
    alignSelf: 'center',
  },
  newContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 'auto',
    paddingVertical: 30,
  },
});

export default Profile;
