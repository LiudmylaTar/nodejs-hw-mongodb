import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntill: { type: Date, required: true },
    refreshTokenValidUntill: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Session = mongoose.model('Session', sessionSchema);
