import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dolx_auth_token';

/**
 * expo-secure-store is backed by the iOS keychain / Android keystore and has
 * no web implementation. The web target is used for design preview and
 * debugging only, so it falls back to localStorage there - which is *not*
 * secure storage, and is deliberately confined to the web build.
 */
const isWeb = Platform.OS === 'web';

/**
 * Reads the JWT token from secure device storage.
 * Returns null if no token is stored.
 */
export async function getToken(): Promise<string | null> {
  if (isWeb) {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Persists a JWT token to secure device storage.
 */
export async function setToken(token: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Removes the JWT token from secure device storage.
 */
export async function clearToken(): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
