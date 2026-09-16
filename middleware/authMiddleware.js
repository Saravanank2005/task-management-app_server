const jwt = require('jsonwebtoken');
const storeService = require('../services/storeService');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kovai_task_manager_jwt_secret_key_2026_spec');

      const user = await storeService.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User authorization failed: Account not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ message: 'Not authorized: Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized: No token provided' });
  }
};

module.exports = { protect };
