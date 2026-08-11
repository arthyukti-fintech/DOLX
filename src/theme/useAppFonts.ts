import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';

/**
 * Loads the brand typefaces. The keys registered here are what
 * `fonts` in ./index.ts refers to by name.
 *
 * Returns false until loading settles; the root layout holds the splash
 * screen until then so text never renders in the system fallback first.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // A font that fails to download shouldn't wedge the app on a blank screen -
  // fall through to the system face instead.
  return loaded || error != null;
}
