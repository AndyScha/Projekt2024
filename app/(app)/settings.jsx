import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Modal } from 'react-native';
import { getAuth, signOut, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';

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

const Settings = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [spotify, setSpotify] = useState('');
  const [apple, setApple] = useState('');
  const [soundcloud, setSoundcloud] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isArtist, setIsArtist] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');
  const [confirmationPassword, setConfirmationPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [changed, setChanged] = useState(false);
  const [initialState, setInitialState] = useState({
    name: '',
    spotify: '',
    apple: '',
    soundcloud: '',
    selectedGenres: [],
    isArtist: false,
  });

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(user.email);
          setName(userData.name || '');
          setSpotify(userData.spotify || '');
          setApple(userData.apple || '');
          setSoundcloud(userData.soundcloud || '');
          setImage(userData.photoURL || null);
          setSelectedGenres(userData.genres || []);
          setIsArtist(userData.artist || false);
          setInitialState({
            name: userData.name || '',
            spotify: userData.spotify || '',
            apple: userData.apple || '',
            soundcloud: userData.soundcloud || '',
            selectedGenres: userData.genres || [],
            isArtist: userData.artist || false,
          });
        } else {
          console.log('Kein Profil gefunden.');
        }
      }
    };
    fetchUserData();
  }, [auth, db]);

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const profileRef = doc(db, 'users', user.uid);

        if (!name) {
          throw new Error("Name darf nicht leer sein");
        }

        await setDoc(profileRef, {
          name: name,
          email: user.email,
          spotify: spotify,
          apple: apple,
          soundcloud: soundcloud,
          photoURL: image,
          genres: selectedGenres,
          artist: isArtist
        }, { merge: true });

        alert('Profil erfolgreich aktualisiert!');
        navigation.navigate('Profil');
      }
    } catch (error) {

      if (!name) {
        alert("Name darf nicht leer sein");
      }
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Zugriffsberechtigung auf Fotos benötigt');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const response = await fetch(result.uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        setImage(downloadURL);

        const user = auth.currentUser;
        const profileRef = doc(db, 'users', user.uid);
        await setDoc(profileRef, { photoURL: downloadURL }, { merge: true });

        console.log('Bild hochgeladen und Profil aktualisiert');
      }
    } catch (error) {
      console.error('Fehler beim Hochladen des Bildes:', error);
      alert('Fehler beim Hochladen des Bildes.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setModalVisible(false)
      navigation.navigate('index');
    } catch (error) {
      console.error('Fehler beim Ausloggen:', error);
      alert('Fehler beim Ausloggen.');
    }
  };

  const deleteProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, confirmationPassword);
        await reauthenticateWithCredential(user, credential);

        await deleteDoc(doc(db, 'users', user.uid));
        await user.delete();

        console.log('Nutzerkonto erfolgreich gelöscht.');
        alert('Nutzerkonto erfolgreich gelöscht.');
        navigation.navigate('index');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Nutzerkontos:', error);
      setDeleteError('Das eingegebene Passwort ist falsch.');
    }
  };

  const toggleArtistStatus = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const profileRef = doc(db, 'users', user.uid);
        await setDoc(profileRef, { artist: !isArtist }, { merge: true });
        setIsArtist(!isArtist);
        alert('Status erfolgreich aktualisiert! Bitte melde dich neu an.');
        navigation.navigate('index');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Künstlerstatus:', error);
      alert('Fehler beim Aktualisieren des Künstlerstatus.');
    }
  };

  const getGenreColorWithOpacity = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const clearName = () => {
    setName('');
  };

  const clearSpotify = () => {
    setSpotify('');
    setChanged(true);
  };

  const clearApple = () => {
    setApple('');
    setChanged(true);
  };

  const clearSoundcloud = () => {
    setSoundcloud('');
    setChanged(true);
  };

  const renderGenres = () => {
  
    return genres.map((genre) => (
      <TouchableOpacity
        key={genre.key}
        style={[
          styles.genreButton,
          {
            backgroundColor: selectedGenres.includes(genre.value) ? getGenreColorWithOpacity(genre.color, 0.5) : '#FFFFFF',
          },
        ]}
        onPress={() => {toggleGenre(genre.value); setChanged(true);}}
      >
        <Text
          style={[
            styles.genreText,
            { color: selectedGenres.includes(genre.value) ? '#FFFFFF' : '#000000' },
          ]}
        >
          {genre.value}
        </Text>
      </TouchableOpacity>
    ));
  };

  const toggleGenre = (genre) => {
    const isSelected = selectedGenres.includes(genre);
  
    if (isSelected) {
      const updatedGenres = selectedGenres.filter((g) => g !== genre);
      setSelectedGenres(updatedGenres);
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const abbrechen = () => {
    setName(initialState.name);
    setSpotify(initialState.spotify);
    setApple(initialState.apple);
    setSoundcloud(initialState.soundcloud);
    setSelectedGenres(initialState.selectedGenres);
    setIsArtist(initialState.isArtist);
    setChanged(false);
    navigation.navigate('Profil'); 
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
      >
        <View style={styles.messageBox}>
          <Text style={styles.screenTitle}>Einstellungen</Text>

          <Text style={styles.text}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              placeholder="Name eingeben"
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

          <Text style={styles.text}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.noInputField} value={email} editable={false} />
          </View>

          <Text style={styles.text}>Profilbild ändern</Text>

          <View style={styles.inputWrapperImage}>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Bild auswählen</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.text}>Artist oder Fan?</Text>

          <View style={styles.buttonContainerS}>
            <TouchableOpacity
              style={[styles.buttonS, isArtist ? styles.activeButtonS : null]}
              onPress={toggleArtistStatus}
              disabled={isArtist}
            >
              <Text style={styles.buttonTextS}>Artist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonS, !isArtist ? styles.activeButtonS : null]}
              onPress={toggleArtistStatus}
              disabled={!isArtist}
            >
              <Text style={styles.buttonTextS}>Fan</Text>
            </TouchableOpacity>
          </View>


        {isArtist ? (

        <View>
          <Text style={styles.text}>Spotify Account</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              placeholder="Link zu deinem Spotify Account eingeben"
              placeholderTextColor={'gray'}
              style={styles.inputField} 
              value={spotify} 
              onChangeText={(text) => { 
                setSpotify(text);
                setChanged(true);
              }}
            />

            {spotify.length > 0 && (
                  <TouchableOpacity
                      onPress={clearSpotify}
                      style={styles.clearButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
            )}

          </View>

          <Text style={styles.buttonText}></Text>
          <View>

            <Text style={styles.text}>Apple Music Account</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Link zu deinem Alpple Music Account eingeben"
                placeholderTextColor={'gray'}
                style={styles.inputField} 
                value={apple} 
                 onChangeText={(text) => { 
                   setApple(text);
                   setChanged(true);
                 }}
               />

               {apple.length > 0 && (
                     <TouchableOpacity
                         onPress={clearApple}
                         style={styles.clearButton}
                         hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                     >
                       <Text style={styles.clearButtonText}>×</Text>
                     </TouchableOpacity>
                )}

            </View>

            <Text style={styles.buttonText}></Text>
            
          </View>

          <View>
            <Text style={styles.text}>Soundcloud Account</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                placeholder="Link zu deinem Soundcloud Account eingeben"
                placeholderTextColor={'gray'}
                style={styles.inputField} 
                value={soundcloud} 
                onChangeText={(text) => { 
                  setSoundcloud(text);
                  setChanged(true);
                }}
              />

              {soundcloud.length > 0 && (
                    <TouchableOpacity
                        onPress={clearSoundcloud}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.clearButtonText}>×</Text>
                    </TouchableOpacity>
              )}

            </View>
            <Text style={styles.buttonText}></Text>
          </View>
        
        </View>

          ) : (          

            <View></View>

          )}

          {isArtist ? (

            <View>
              <Text style={styles.text}>Wähle deine Genres aus:</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.text}>Wähle deine Lieblings-Genres aus:</Text>
            </View>
          )}

          <View style={styles.genreContainer}>
            {renderGenres()}
          </View>

          <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.abbrechenButton} onPress={abbrechen}>
                <Text style={styles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.button, { opacity: (changed) ? 1 : 0.4 }]} disabled={!changed} onPress={handleSaveProfile}>
                <Text style={styles.buttonText}>Änderungen speichern</Text>
              </TouchableOpacity>
          </View>
  
          <TouchableOpacity style={styles.buttonLL} onPress={() => setDeleteModal(true)}>
            <Text style={styles.buttonTextLL}>Nutzerkonto löschen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonLL} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonTextLL}>Logout</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Möchtest Du dich wirklich abmelden?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <Text style={styles.actionButtonText}>Abmelden</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    <Modal
      animationType="slide"
      transparent={true}
      visible={deleteModal}
      onRequestClose={() => setDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Möchtest Du dein Nutzerkonto wirklich löschen?</Text>
          <TextInput
            style={styles.input}
            placeholder="Nutzernamen eingeben"
            value={confirmationName}
            onChangeText={setConfirmationName}
          />
          <TextInput
            style={styles.input}
            placeholder="Passwort eingeben"
            value={confirmationPassword}
            onChangeText={setConfirmationPassword}
            secureTextEntry
          />
          {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.deleteButton, confirmationName !== name && styles.disabledButton]}
              onPress={deleteProfile}
              disabled={confirmationName !== name}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoutIcon: {
    width: 30,
    height: 30,
    tintColor: '#f07151',
    marginRight: 10,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#555555',
    color: 'white',
    width: '100%',
    padding: 10,
    paddingLeft: 15,
    borderRadius: 10,
    marginBottom: 15,
    height: 42,
    borderColor: 'white',
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#f07151',
  },
  button: {
    backgroundColor: '#f07151',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
    justifyContent: 'center',
  },
  abbrechenButton: {
    backgroundColor: '#3C3C47',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
    marginLeft: 30,
  },
  imageButton: {
    backgroundColor: '#f07151',
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 15,
    marginRight: 20,
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
  actionButton: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#000',
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
  disabledButton: {
    opacity: 0.5,
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
  genreButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
  },
  genreText: {
    fontSize: 12,
  },
  buttonContainerS: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 30,
    paddingHorizontal: 30,
  },
  buttonContainerLL: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonS: {
    paddingHorizontal: 35,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    width: 115,
  },
  buttonLL: {
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#3C3C47',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  activeButtonS: {
    backgroundColor: '#f07151',
  },
  buttonTextS: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  buttonTextLL: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  searchInputM: {
    color: '#333',
  },
  dropdownMenuM: {
    marginTop: 15,
    borderRadius: 10,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  inputGroupM: {
    paddingTop: 5,
  },
  itemsContainerM: {
    maxHeight: 300,
  },
  listContainerM: {
    borderColor: '#CCC',
    borderWidth: 1,
  },
  textDropdownM: {
    fontSize: 16,
    color: '#333',
  },
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
  noInputField: {
    backgroundColor: '#3C3C47',
    color: '#171717',
    width: '100%',
    padding: 10,
    paddingLeft: 19,
    borderRadius: 10,
    marginBottom: 25,
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
  inputWrapperImage: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
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
  textsuperSmall: {
    fontSize: 1,
  },
});

export default Settings;