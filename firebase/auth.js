import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
};

export const sendOTP = async (phoneNumber, appVerifier) => {
  const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return result;
};

export const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};
