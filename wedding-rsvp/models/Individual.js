const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Individual Schema
const individualSchema = new Schema({
  invitationCode: { type: String, required: true }, // Shared code for family/group
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  groupName: { type: String, required: true },
  email: { type: String },
  rsvpStatus: { 
    type: String, 
    enum: ['Accepted', 'Declined', 'Pending', 'No Response'], 
    default: 'Pending' 
  },
  dietaryRestrictions: { 
    type: [String], 
    enum: ['Dairy-free', 'Diabetic', 'Egg-free', 'Gluten-free', 'Halal', 'Keto', 'Kosher', 'Lactose intolerant', 'No spicy food', 'Nut-free', 'Shellfish-free', 'Soy-free', 'Vegan', 'Vegetarian'], 
    default: [] 
  },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to automatically update `updatedAt` before saving a document
individualSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create or get the Individual model, avoiding model overwrite
const Individual = mongoose.models.Individual || mongoose.model('Individual', individualSchema);

module.exports = Individual;
