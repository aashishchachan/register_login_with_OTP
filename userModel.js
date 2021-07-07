const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "A name must be there"],
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    required: [true, "A name must be there"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide a password"],
    validate: [
      function (el) {
        return el === this.password;
      },
      "Passwords doesn't match",
    ],
    mobile: {
      type: String,
      required: [true, "Please provide a mobile number"],
      validate: [
        function (el) {
          if (this.mobile.length == 12 || (this.mobile.length == 13 && this.mobile[0]=='+'))
            return el === this.password;
        },
        "Passwords doesn't match",
      ],
    },

    dob: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    education: {
      type: String,
      required: [true, "Please provide education"],
    },
    address: {
      type: String,
      required: [true, "Please provide address"],
    },
    pinCode: {
      type: String,
      required: [true, "Please provide pin code"],
    },
    city: {
      type: String,
      required: [true, "Please provide city"],
    },
    state: {
      type: String,
      required: [true, "Please provide state"],
    },
    country: {
      type: String,
      required: [true, "Please provide country"],
    },
    attachment: {
      type: String,
      required: [true, "Please upload attachment"],
    },
  },
});

userSchema.pre("save", async function (next) {
  //check if the function been called for password modification and not something else
  if (!this.isModified("password")) return next();

  //hashing with the power of 12
  this.password = await bcrypt.hash(this.password, 12);

  //undefining password confirm as we no longer require that
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (candidatePass, userPass) {
    return await bcrypt.compare(candidatePass, userPass)
}

const User = new mongoose.model("User", userSchema);

module.exports = User;
