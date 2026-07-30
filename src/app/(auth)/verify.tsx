import { StyleSheet, Text, View } from 'react-native';

export default function VerifyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
