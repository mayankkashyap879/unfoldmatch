// server/models/User.ts

import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from 'mongoose';
import { TimestampedDocument } from '../types/modelTypes';
import { UserPurpose, GenderType, USER_PURPOSES, GENDER_TYPES } from '../constants/modelEnums';
import { userValidationSchema, UserValidationSchema } from '../validation/userValidation';
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
  bio: { type: String, default: '' },
  interests: [{ type: String, default: [] }],
  purpose: { type: String, enum: USER_PURPOSES, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: GENDER_TYPES, required: true },
  searchGlobally: { type: Boolean, default: true },
  country: { type: String, default: '' },
  personalityType: { type: String, default: '' },
  preferences: {
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 50 }
    },
    genderPreference: [{ type: String, enum: GENDER_TYPES, default: [] }]
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
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

// Apply all validations from userValidationSchema
(Object.keys(userValidationSchema) as Array<keyof UserValidationSchema>).forEach((path) => {
  if (userValidationSchema[path].validate) {
    UserSchema.path(path).validate(
      userValidationSchema[path].validate.validator,
      userValidationSchema[path].validate.message
    );
  }
});

// Additional validations
UserSchema.path('username').validate(async function(username: string) {
  const userCount = await mongoose.models.User.countDocuments({ username });
  return !userCount;
}, 'Username already exists');

UserSchema.path('email').validate(async function(email: string) {
  const userCount = await mongoose.models.User.countDocuments({ email });
  return !userCount;
}, 'Email already exists');

export const User = mongoose.model<IUser>('User', UserSchema);