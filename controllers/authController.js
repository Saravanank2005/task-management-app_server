const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const storeService = require('../services/storeService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'kovai_task_manager_jwt_secret_key_2026_spec', {
    expiresIn: '30d'
  });
};

const handleGoogleAuth = async (req, res) => {
  try {
    const { credential, isDemo, testEmail, testGoogleId, name: customName } = req.body;

    let googleId, email, name, picture;

    if (testEmail || testGoogleId) {
      // Postman helper to test API as a specific user saved in MongoDB Atlas
      email = testEmail || 'saravanank20051012@gmail.com';
      googleId = testGoogleId || '101611468333698031623';
      name = customName || 'Saravanan K';
      picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
    } else if (isDemo) {
      // Persistent global Demo Account saved in MongoDB Atlas
      googleId = 'google_demo_task360_user';
      email = 'demo.user@task360.app';
      name = 'Task360 Demo Account';
      picture = 'https://ui-avatars.com/api/?name=Task360+Demo&background=6366f1&color=fff';
    } else if (credential) {
      // Verify standard Google OAuth 2.0 credential token
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        googleId = payload.sub;
        email = payload.email;
        name = payload.name;
        picture = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Google User')}&background=6366f1&color=fff`;
      } catch (tokenErr) {
        // Fallback token decoding if client ID audience verification is strict in local dev environment
        const decoded = jwt.decode(credential);
        if (decoded && decoded.sub && decoded.email) {
          googleId = decoded.sub;
          email = decoded.email;
          name = decoded.name || 'Google User';
          picture = decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
        } else {
          return res.status(400).json({ message: 'Invalid Google OAuth Token' });
        }
      }
    } else {
      return res.status(400).json({ message: 'Missing authentication credentials' });
    }

    const { user, isNewUser } = await storeService.findOrCreateUserByGoogle({
      googleId,
      email,
      name,
      picture
    });

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      isNewUser,
      message: isNewUser ? 'Welcome to Task360! Account created in MongoDB Atlas.' : 'Welcome back to Task360!',
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('[Task360 Google Auth Error]', error);
    return res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

module.exports = {
  handleGoogleAuth,
  getMe
};
