import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
let temp = '';
export { temp };

const GenreTile = ({ genre }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    temp = genre.value; // Sicherstellen, dass der Wert korrekt gesetzt wird
    router.push(`EventsByGenre`, { genre: genre.value }); // Navigiere zu EventsByGenre
  };

  const getGenreColorWithOpacity = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: getGenreColorWithOpacity(genre.color, 0.5) }]}
      onPress={handlePress}
    >
      <Text style={styles.tileText}>{genre.value}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    margin: 10,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // Textfarbe auf weiß geändert, damit sie besser lesbar ist
  },
});

export default GenreTile;
