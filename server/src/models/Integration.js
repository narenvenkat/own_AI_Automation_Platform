import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
      index: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
      index: true,
    },
    accountName: {
      type: String,
      default: '',
    },
    accountEmail: {
      type: String,
      default: '',
    },
    scopes: {
      type: [String],
      default: [],
    },
    // Encrypted payloads stored as { iv, encryptedData, tag }
    encryptedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false, // Protected from accidental select
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

export const Integration = mongoose.model('Integration', integrationSchema);
