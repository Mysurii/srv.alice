import { HTTP_STATUS, sendResponse } from './../utils/endpoint-utils';
import type { Request, Response } from 'express';
import type { User } from './../models/user.model';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import UserRepository from '../repositories/user.repository';
import { sendError } from '../utils/endpoint-utils';
import validator from 'validator';
import { compare, hash } from 'bcrypt';
import Logger from '../utils/Logger';
import { env_variables } from '../config';
import { createAccessToken, createRefreshToken } from '../utils/jwt';
import axios from 'axios';

const userController = Router();
const userRepository = new UserRepository();

userController.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) return sendError(res, HTTP_STATUS.BAD, 'Please provide all the fields required');

  if (!validator.isEmail(email)) return sendError(res, HTTP_STATUS.BAD, 'Email is not valid');

  // default: minLength=8, minLowercase=1, minUppercase=1, minNumbers=1, minSymbols=1
  if (!validator.isStrongPassword(password)) return sendError(res, HTTP_STATUS.BAD, 'Password not strong enough');

  const emailExists = await userRepository.getUserByEmail(email);

  if (emailExists) return sendError(res, HTTP_STATUS.BAD, 'Email is already in use');

  const saltRounds = 10;

  const newUser: Partial<User> = {
    email,
    name,
    password: await hash(password, saltRounds),
    role: 'user',
  };

  try {
    const success = await userRepository.addUser(newUser);

    if (success) {
      const user = await userRepository.getUserByEmail(newUser.email!);
      if (user) {
        const response = await axios.get(`${env_variables.CHATBOT_API}/intents/${user?._id}`);
        console.log(response);
      }
    }
  } catch (err) {
    Logger.error(err);
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Something went wrong while trying to create accout');
  }

  return sendResponse(res, HTTP_STATUS.OK, { message: 'Successfully created!' });
});

userController.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Please provide a valid email and password');

  const user = await userRepository.getUserByEmail(email);

  if (!user) {
    return sendError(res, HTTP_STATUS.BAD, 'User with the given email not found');
  }

  const isCorrectPassword = await compare(password, user.password);

  if (!isCorrectPassword) return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Invalid credentials');

  let accessToken: string = user.tokens?.accessToken;
  let refreshToken: string = user.tokens?.refreshToken;

  let newTokens = true;

  if (typeof user.tokens !== 'undefined') {
    try {
      jwt.verify(user.tokens.accessToken, env_variables.TOKENS.secret);
      jwt.verify(user.tokens.refreshToken, env_variables.TOKENS.secret);

      accessToken = user.tokens.accessToken;
      refreshToken = user.tokens.refreshToken;

      newTokens = false;
    } catch (err) {
      accessToken = createAccessToken(user);
      refreshToken = createRefreshToken(user);
    }
  } else {
    accessToken = createAccessToken(user);
    refreshToken = createRefreshToken(user);
  }

  if (newTokens) {
    user.tokens = { accessToken, refreshToken };
    const success = await userRepository.updateUser(user);

    if (!success) {
      return sendError(res, HTTP_STATUS.BAD, 'Something went wrong with storing the tokens');
    }
  }

  const tokens = {
    accessToken,
    refreshToken,
    role: user.role,
    id: user._id,
  };
  sendResponse(res, HTTP_STATUS.OK, tokens);
});

export default userController;
