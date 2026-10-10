import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [1, "Name cannot be empty"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude from queries by default
    },
    role: {
      type: String,
      enum: {
        values: ["CUSTOMER", "ADMIN"],
        message: "Role must be either CUSTOMER or ADMIN",
      },
      default: "CUSTOMER",
    },
  },
  { timestamps: true },
);

/**
 * Ensure passwordHash is never returned in JSON responses
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v; // MongoDB version field
  return user;
};

/**
 * Hash password before saving to database
 * Skip if passwordHash is already hashed (handled by authService)
 */
userSchema.pre("save", async function (next) {
  // Skip hashing if passwordHash is already hashed
  // (authService.createUser already hashes the password)
  next();
});

/**
 * Compare plaintext password with stored hash
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

export default User;
