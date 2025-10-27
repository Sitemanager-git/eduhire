const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['teacher', 'institution'],
    required: true,
  },
  profile: {
    // Nested object, customize as needed
    name: { type: String },
    // add more profile fields here as needed
  },
  status: {
    type: String,
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT auth token
UserSchema.methods.generateAuthToken = function () {
  const payload = { id: this._id, email: this.email, userType: this.userType };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
