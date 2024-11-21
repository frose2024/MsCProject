import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, Text } from 'react-native';

export default function LogoutButton() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout(navigation);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
}
