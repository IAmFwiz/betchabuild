import { View, Text, StyleSheet } from 'react-native';

export default function Search() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Search for teams, players, and bets</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});
