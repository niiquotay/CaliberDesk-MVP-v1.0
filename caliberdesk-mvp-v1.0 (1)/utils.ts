
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { UserProfile } from './types';

/**
 * Verifies if a phone number is valid for a given country.
 * @param phone The phone number string.
 * @param country The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'NG').
 */
export const validatePhoneNumber = (phone: string, country: string): boolean => {
  if (!phone || !country) return false;
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, country as CountryCode);
    return phoneNumber ? phoneNumber.isValid() : false;
  } catch (error) {
    return false;
  }
};

/**
 * Calculates the profile completion percentage for a seeker.
 * @param user The user profile object.
 */
export const calculateProfileCompletion = (user: UserProfile): number => {
  if (!user) return 0;
  
  const weights: { [key: string]: number } = {
    firstName: 5,
    lastName: 5,
    middleName: 2,
    email: 5,
    phoneNumbers: 5,
    city: 5,
    country: 5,
    jobPreferences: 10, // categories, locations, roles
    openToTravel: 3,
    personalTitle: 2,
    gender: 3,
    race: 5,
    disabilityStatus: 5,
    workHistory: 15,
    education: 15,
    skills: 10,
    voluntaryActivities: 5
  };

  let totalWeight = 0;
  let completedWeight = 0;

  for (const [field, weight] of Object.entries(weights)) {
    totalWeight += weight;
    
    const value = (user as any)[field];
    
    if (field === 'jobPreferences') {
      if (value && (value.categories?.length > 0 || value.locations?.length > 0 || value.roles?.length > 0)) {
        completedWeight += weight;
      }
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        completedWeight += weight;
      }
    } else if (typeof value === 'boolean') {
      // For boolean, we assume if it's defined (not undefined/null), it's "completed"
      if (value !== undefined && value !== null) {
        completedWeight += weight;
      }
    } else if (value) {
      completedWeight += weight;
    }
  }

  return Math.round((completedWeight / totalWeight) * 100);
};
