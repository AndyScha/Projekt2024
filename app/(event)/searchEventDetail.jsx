import React from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { data } from '../(genre)/EventsByGenre';
import { Link } from 'expo-router';
import { detail } from '../(app)/search';

const SearchEventDetail = () => {
  const route = useRoute();
  const { eventDetail } = route.params;
  const filteredData = data.filter(item => item.name === detail && item.type === 'Event')
  
  
  

  return (
    <View style={styles.container}>
      <View className="mb-7">
        <Link href="/genre" className="text-lg font-psemibold text-secondary">← Zurück zu Genres</Link>
      </View>
      <Text style={styles.title}>Event Details</Text>
      <FlatList
     
        data={filteredData}
        renderItem={({ item }) => 
        <><Text style={styles.itemContainer}>Name: {item.name}</Text>
        <Text style={styles.itemContainer}>Genre: {item.genre}</Text>
        <Text style={styles.itemContainer}>Künstler:</Text>
        <Text style={styles.itemContainer}>Location:</Text></>
        }
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight + 60 || 20,
    flex: 1,
    padding: 10,
    backgroundColor: '#161622',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
  },
  itemContainer: {
    height: 50,
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#CDCDE0',
    color: '#ffffff',
    font: 'pregular',
    fontSize: 16,
  }
});

export default SearchEventDetail;