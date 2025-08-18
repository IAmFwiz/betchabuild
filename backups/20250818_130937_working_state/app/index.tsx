import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000', '#111']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Image 
        source={require('../assets/newbetcha-transparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Decide. Swipe. Done.</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/auth')}>
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Sign In / Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(tabs)')}>
          <Text style={styles.secondaryButtonText}>Browse as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.4,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#00D4FF',
    marginBottom: 60,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
