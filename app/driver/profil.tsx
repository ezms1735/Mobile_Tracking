import { StyleSheet, Text, View } from 'react-native';
import BottomNavDriver from '../../components/ButtomNavDriver';

export default function ProfilDriver() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil Driver</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholder}>Fitur profil sedang dikembangkan</Text>
      </View>

      <BottomNavDriver />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
});
