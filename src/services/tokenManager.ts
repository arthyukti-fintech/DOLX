import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dolx_auth_token';

/**
 * Reads the JWT token from secure device storage.
 * Returns null if no token is stored.
 */
export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Persists a JWT token to secure device storage.
 */
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Removes the JWT token from secure device storage.
 */
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
