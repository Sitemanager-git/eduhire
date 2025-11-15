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
    // Profile completion tracking
    name: { type: String },
    completed: { 
      type: Boolean, 
      default: false 
    },
    completedAt: { 
      type: Date, 
      default: null 
    },
    profileType: { 
      type: String,
      enum: ['institution', 'teacher', 'student'],
      default: null
    }
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
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    userType: this.userType
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  return token;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
