const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Name validation
    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      return res.status(400).json({ error: 'First name and last name cannot be empty' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Combine firstName and lastName into fullName for model
    const fullName = `${firstName} ${lastName}`.trim();

    const user = await User.create({
      email,
      password,
      fullName,
      role: 'member'
    });

    // Get JWT secret with fallback for development
    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key-change-in-production' : null);
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 LOGIN ATTEMPT:', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('❌ LOGIN: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ LOGIN: User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ LOGIN: User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isQualified: user.isQualified,
      hasPasswordHash: !!user.password
    });

    // Password comparison
    console.log('🔍 LOGIN: Comparing password...');
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔍 LOGIN: Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ LOGIN: Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ADMIN USERS: Skip all qualification checks
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      console.log('✅ LOGIN: Admin user detected - bypassing all qualification checks');
    } else {
      console.log('ℹ️ LOGIN: Regular user - role:', user.role, 'isQualified:', user.isQualified);
    }

    // Get JWT secret with fallback for development
    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key-change-in-production' : null);
    
    if (!jwtSecret) {
      console.error('❌ LOGIN: JWT_SECRET is not set in environment variables');
      if (process.env.NODE_ENV !== 'development') {
        return res.status(500).json({ error: 'Server configuration error' });
      }
      console.warn('⚠️ LOGIN: Using development fallback JWT_SECRET');
    }

    console.log('🔍 LOGIN: Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log('✅ LOGIN: JWT token generated successfully');

    // Prepare user response object
    const userResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isQualified: user.isQualified || isAdmin // Admin is always considered qualified
    };

    // Only include teamId if user has one
    if (user.teamId) {
      userResponse.teamId = user.teamId;
    }

    console.log('✅ LOGIN: Successful login for user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isQualified: user.isQualified || user.role === 'admin',
        teamId: user.teamId || null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { register, login, getProfile };
