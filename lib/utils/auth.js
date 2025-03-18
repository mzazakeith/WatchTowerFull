import { randomBytes } from 'crypto';
import connectToDatabase from '../db/connection';
import { User, Service } from '../db/models';

// /**
//  * Create a session for a user
//  */
// export function createUserSession(user) {
//   // Create a session object with necessary user information
//   return {
//     userId: user._id,
//     email: user.email,
//     name: user.name,
//     role: user.role,
//     teams: user.teams,
//     primaryTeam: user.primaryTeam,
//     isActive: user.isActive,
//     lastLogin: user.lastLogin || new Date(),
//   };
// }

/**
 * Check if a user has admin role
 */
export function isAdmin(session) {
  return session?.role === 'admin';
}

/**
 * Check if a user has access to a team
 */
export function hasTeamAccess(session, teamId) {
  if (!session || !teamId) return false;
  
  // Admin has access to all teams
  if (session.role === 'admin') return true;
  
  // Check if user is a member of the team
  return session.teams && session.teams.some(t => t.toString() === teamId.toString());
}

/**
 * Generates a random authentication code for email verification
 * @returns {Object} Object containing the generated code
 */
export function generateAuthCode(length = 6) {
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  return {
    code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Code expires in 15 minutes
  };
}

// /**
//  * Verifies if the provided code matches the generated code
//  * @param {string} providedCode The code provided by the user
//  * @param {string} generatedCode The code that was generated
//  * @returns {boolean} Whether the codes match
//  */
// export function verifyAuthCode(providedCode, generatedCode) {
//   return providedCode === generatedCode;
// }

/**
 * Mock function to simulate storing user data
 * In a real app, this would store user data in a database
 */
export async function createUser(userData) {
  console.log('Creating user:', userData);
  return {
    id: 'user_' + Math.random().toString(36).substring(2, 15),
    ...userData,
    createdAt: new Date()
  };
}

/**
 * Mock function to simulate authenticating a user
 * In a real app, this would check credentials against a database
 */
export async function authenticateUser(email) {
  console.log('Authenticating user:', email);
  return {
    id: 'user_' + Math.random().toString(36).substring(2, 15),
    email,
    name: 'John Doe', // In real app, would fetch from DB
    createdAt: new Date()
  };
}

/**
 * Creates an authentication code for a user
 * @param {string} identifier - Email or phone number
 * @param {string} identifierType - 'email' or 'phone'
 * @param {string} name - User's name (for new users)
 * @returns {Promise<{user: Object, code: string}>}
 */
export async function createAuthCode(identifier, identifierType = 'email', name = null) {
  // Normalize the identifier
  const normalizedIdentifier = identifierType === 'email' 
    ? identifier.toLowerCase()
    : normalizePhoneNumber(identifier);
  
  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  // Find user by email or phone
  const query = identifierType === 'email' 
    ? { email: normalizedIdentifier }
    : { phone: normalizedIdentifier };
  
  let user = await User.findOne(query);
  
  if (user) {
    // Update existing user's auth code
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'authCode.code': code,
          'authCode.expiresAt': expiresAt,
          'authCode.attempts': 0,
          'authCode.lastAttempt': new Date(),
          name: name || user.name, // Update name if provided
        },
      }
    );
    
    // Refresh user data
    user = await User.findById(user._id);
  } else if (name) {
    // Create new user if name is provided
    const userData = {
      name,
      'authCode.code': code,
      'authCode.expiresAt': expiresAt,
      'authCode.attempts': 0,
      'authCode.lastAttempt': new Date(),
    };
    
    // Set either email or phone based on identifier type
    if (identifierType === 'email') {
      userData.email = normalizedIdentifier;
    } else {
      userData.phone = normalizedIdentifier;
    }
    
    user = await User.create(userData);
  } else {
    throw new Error('User not found and no name provided for registration');
  }
  
  return { user, code };
}

/**
 * Verifies an authentication code
 * @param {string} identifier - Email or phone number
 * @param {string} identifierType - 'email' or 'phone'
 * @param {string} code - The verification code
 * @returns {Promise<Object>} - The user object
 */
export async function verifyAuthCode(identifier, identifierType = 'email', code) {
  // Normalize the identifier
  const normalizedIdentifier = identifierType === 'email' 
    ? identifier.toLowerCase()
    : normalizePhoneNumber(identifier);
  
  // Create query based on identifier type
  const query = {
    'authCode.code': code,
    'authCode.expiresAt': { $gt: new Date() }
  };
  
  if (identifierType === 'email') {
    query.email = normalizedIdentifier;
  } else {
    query.phone = normalizedIdentifier;
  }
  
  // Find the user
  const user = await User.findOne(query);
  
  if (!user) {
    throw new Error('Invalid or expired verification code');
  }
  
  return user;
}

/**
 * Creates a session object for the user
 * @param {Object} user - The user object
 * @returns {Object} - Session data
 */
export function createUserSession(user) {
  return {
    userId: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    teams: user.teams,
    primaryTeam: user.primaryTeam
  };
}

/**
 * Normalizes a phone number to E.164 format
 * @param {string} phoneNumber - The phone number to normalize
 * @returns {string} - Normalized phone number
 */
export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  let normalized = phoneNumber.replace(/\D/g, '');
  
  // Ensure it has a + prefix if it doesn't already
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}