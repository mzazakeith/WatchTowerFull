import { randomBytes } from 'crypto';
import connectToDatabase from '../db/connection';
import { User, Service } from '../db/models';

// /**
//  * Generate a random auth code for passwordless login
//  */
// export function generateAuthCode(length = 6) {
//   // Generate random numbers for the code
//   const code = randomBytes(length)
//     .readUIntBE(0, length)
//     .toString()
//     .padStart(length * 2, '0')
//     .slice(0, length);
  
//   // Set expiration to 15 minutes from now
//   const expiresAt = new Date();
//   expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  
//   return {
//     code,
//     expiresAt,
//   };
// }

/**
 * Create or update a user with an auth code
 */
export async function createAuthCode(email, name = '') {
  await connectToDatabase();
  
  const { code, expiresAt } = generateAuthCode();
  
  // Find user by email or create a new one
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $setOnInsert: {
        name: name || email.split('@')[0],
        role: 'user',
        isActive: true,
      },
      authCode: {
        code,
        expiresAt,
        attempts: 0,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
  
  return { user, code };
}

/**
 * Verify an auth code for a user
 */
// export async function verifyAuthCode(email, code) {
//   await connectToDatabase();
  
//   // Find user by email
//   const user = await User.findOne({ email: email.toLowerCase() });
  
//   if (!user) {
//     return { success: false, message: 'User not found' };
//   }
  
//   // Check if user is active
//   if (!user.isActive) {
//     return { success: false, message: 'User account is inactive' };
//   }
  
//   // Check if auth code exists
//   if (!user.authCode || !user.authCode.code) {
//     return { success: false, message: 'No authentication code found' };
//   }
  
//   // Update attempts
//   await User.updateOne(
//     { _id: user._id },
//     {
//       $inc: { 'authCode.attempts': 1 },
//       $set: { 'authCode.lastAttempt': new Date() },
//     }
//   );
  
//   // Check if too many attempts
//   if (user.authCode.attempts >= 5) {
//     return { success: false, message: 'Too many attempts' };
//   }
  
//   // Check if code is expired
//   if (new Date() > user.authCode.expiresAt) {
//     return { success: false, message: 'Authentication code expired' };
//   }
  
//   // Check if code matches
//   if (user.authCode.code !== code) {
//     return { success: false, message: 'Invalid authentication code' };
//   }
  
//   // Clear auth code after successful verification
//   await User.updateOne(
//     { _id: user._id },
//     {
//       $set: {
//         'authCode.code': null,
//         'authCode.expiresAt': null,
//         'authCode.attempts': 0,
//         lastLogin: new Date(),
//       },
//     }
//   );
  
//   return { success: true, user };
// }

/**
 * Create a session for a user
 */
export function createUserSession(user) {
  // Create a session object with necessary user information
  return {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    teams: user.teams,
    primaryTeam: user.primaryTeam,
    isActive: user.isActive,
    lastLogin: user.lastLogin || new Date(),
  };
}

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

/**
 * Verifies if the provided code matches the generated code
 * @param {string} providedCode The code provided by the user
 * @param {string} generatedCode The code that was generated
 * @returns {boolean} Whether the codes match
 */
export function verifyAuthCode(providedCode, generatedCode) {
  return providedCode === generatedCode;
}

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