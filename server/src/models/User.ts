// server/models/User.ts

import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from 'mongoose';
import { TimestampedDocument } from '../types/modelTypes';
import { UserPurpose, GenderType, USER_PURPOSES, GENDER_TYPES } from '../constants/modelEnums';
import { userValidationSchema } from '../validation/userValidation';
import { hashPassword, comparePasswords } from '../services/authService';

export interface IUser extends TimestampedDocument {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  bio?: string;
  interests: string[];
  purpose: UserPurpose;
  age: number;
  gender: GenderType;
  searchGlobally: boolean;
  country?: string;
  personalityType?: string;
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    genderPreference: GenderType[];
  };
  friends: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  interests: [{ type: String }],
  purpose: { type: String, enum: USER_PURPOSES },
  age: { type: Number },
  gender: { type: String, enum: GENDER_TYPES },
  searchGlobally: { type: Boolean, default: true },
  country: { type: String },
  personalityType: { type: String },
  preferences: {
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 50 }
    },
    genderPreference: [{ type: String, enum: GENDER_TYPES }]
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

UserSchema.pre('save', async function(this: IUser & Document, next: CallbackWithoutResultAndOptionalError) {
  if (this.isModified('password')) {
    try {
      this.password = await hashPassword(this.password);
    } catch (error) {
      return next(error instanceof Error ? error : new Error('An unknown error occurred'));
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  return comparePasswords(candidatePassword, this.password);
};

UserSchema.path('age').validate(userValidationSchema.age.validate.validator, userValidationSchema.age.validate.message);
UserSchema.path('email').validate(userValidationSchema.email.validate.validator, userValidationSchema.email.validate.message);
UserSchema.path('bio').validate(userValidationSchema.bio.validate.validator, userValidationSchema.bio.validate.message);

export const User = mongoose.model<IUser>('User', UserSchema);