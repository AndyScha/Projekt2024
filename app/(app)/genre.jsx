import React from 'react';
import { View, FlatList, StyleSheet, StatusBar } from 'react-native';
import GenreTile from '../(genre)/genreTile'; // Anpassen des Imports auf den korrekten Pfad

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


const Genre = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={genres}
        renderItem={({ item }) => <GenreTile genre={item} />}
        keyExtractor={item => item.key}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: StatusBar.currentHeight + 60 || 20,
    backgroundColor: '#161622',
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default Genre;
