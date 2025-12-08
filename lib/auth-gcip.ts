'use client';

// Google Cloud Identity Platform (GCIP) Configuration
// This file manages auth providers and user sessions

import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  User,
  AuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  multiFactor,
  PhoneMultiFactorGenerator,
  PhoneAuthProvider,
  PhoneAuthCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Initialize all OAuth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes for enhanced data access
googleProvider.addScope('profile');
googleProvider.addScope('email');
facebookProvider.addScope('email');
twitterProvider.addScope('tweet.read');
githubProvider.addScope('user:email');

// Provider map for dynamic sign-in
export const providers: Record<string, AuthProvider> = {
  google: googleProvider,
  facebook: facebookProvider,
  twitter: twitterProvider,
  github: githubProvider,
};

// Sign in with OAuth provider
export async function signInWithProvider(providerName: string): Promise<User> {
  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);
  
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Email/Password sign up
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Email/Password sign in
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Sign out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Monitor auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Setup MFA (Multi-Factor Authentication)
export async function enableMFAPhone(phoneNumber: string): Promise<string> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
  }, auth);

  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    phoneNumber,
    recaptchaVerifier
  );

  return verificationId;
}

// Complete MFA verification
export async function completeMFAVerification(verificationId: string, code: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  const credential = PhoneAuthCredential.credential(verificationId, code);
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
  
  await multiFactor(user).enroll(multiFactorAssertion, 'My Phone');
}

// Link additional provider to existing account
export async function linkProviderToAccount(providerName: string): Promise<User> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');

  const provider = providers[providerName];
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Get user's auth providers
export function getLinkedProviders(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  
  return user.providerData.map(p => p.providerId);
}

// Delete account
export async function deleteUserAccount(): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('No authenticated user');
  
  await user.delete();
}

// Check if user has MFA enabled
export function hasMFAEnabled(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return multiFactor(user).enrolledFactors.length > 0;
}
