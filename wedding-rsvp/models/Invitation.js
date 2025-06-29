const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Invitation Schema
const invitationSchema = new Schema({
  invitationCode: { 
    type: String, 
    required: true,
    unique: true,  // Unique code for each family/group
    index: true, // For performance optimization when searching by invitationCode
  },
  groupName: { 
    type: String, 
    required: true,  // Name of the family/group
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now, 
  }
});

// Pre-save hook to automatically update `updatedAt` before saving a document
invitationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create or get the Invitation model, avoiding model overwrite
const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
