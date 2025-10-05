import { user} from "../model/user.model.js";
import { ApiError} from "../utilites/apiError.js";
import { apiResponse } from "../utilites/apiResponse.js";
import asynHandler from "../utilites/asynHandler.js"
import bcrypt from "bcrypt";




// or bcrypt


const Register = asynHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate inputs
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, "All fields are required");
  }
const hashedPassword = await bcrypt.hash(password, 10);


  // Check if user exists
  const existedUser = await user.findOne({
    $or: [{ name }, { email }]
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }

  // Hash password


  // Create new user
  const newUser = await user.create({
    name,
    email,
    password: hashedPassword  ,
  });

  // Select user without password
  const createdUser = await user.findById(newUser._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Error in registration");
  }

  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User registered successfully"));
});

export default Register;


const loginUser = asynHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Check if user exists
  const newuser = await user.findOne({ email });
  if (!newuser) {
    throw new ApiError(404, "User not found");
  }

  // Verify password
  const isPasswordCorrect = await newuser.isPasswordCorrect(password);//ispasswordcorrect
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate tokens
  const accessToken = newuser.generateAccessToken();
  const refreshToken = newuser.generateRefreshToken();

  // Save refresh token in DB
  newuser.refreshToken = refreshToken;
  await newuser.save({ validateBeforeSave: false });

  // Send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        201,
        {
          user: newuser,
          accessToken,
          refreshToken,
        },
        "User login successfully"
      )
    );
});

const logoutUser = asynHandler(async (req, res) => {
  // Get refresh token from cookies
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    // Find user with this refresh token
    const existingUser = await user.findOne({ refreshToken });
    if (existingUser) {
      // Remove refresh token from DB
      existingUser.refreshToken = null;
      await existingUser.save({ validateBeforeSave: false });
    }
  }

  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json(new apiResponse(200, null, "Logged out successfully"));
});




export  {
  Register,
  loginUser,
  logoutUser
}