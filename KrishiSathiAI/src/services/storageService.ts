import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const ROLE_KEY = "user_role";
const FULL_NAME_KEY = "user_full_name";

export const saveAuthData = async (
  token: string,
  role: string,
  fullName: string
) => {

  await SecureStore.setItemAsync(
    TOKEN_KEY,
    token
  );

  await SecureStore.setItemAsync(
    ROLE_KEY,
    role
  );

  await SecureStore.setItemAsync(
    FULL_NAME_KEY,
    fullName
  );
};


export const getToken = async () => {

  return await SecureStore.getItemAsync(
    TOKEN_KEY
  );
};


export const getRole = async () => {

  return await SecureStore.getItemAsync(
    ROLE_KEY
  );
};


export const getFullName = async () => {

  return await SecureStore.getItemAsync(
    FULL_NAME_KEY
  );
};


export const clearAuthData = async () => {

  await SecureStore.deleteItemAsync(
    TOKEN_KEY
  );

  await SecureStore.deleteItemAsync(
    ROLE_KEY
  );

  await SecureStore.deleteItemAsync(
    FULL_NAME_KEY
  );
};