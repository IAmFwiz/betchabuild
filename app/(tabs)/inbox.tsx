import { View, Text, StyleSheet } from 'react-native';

export default function Inbox() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>
      <Text style={styles.subtitle}>Your shared predictions and messages</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});
