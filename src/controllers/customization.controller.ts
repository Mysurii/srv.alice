import type { Customization } from './../models/customization.model';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { getUser, HTTP_STATUS, sendResponse } from '../utils/endpoint-utils';
import { sendError } from '../utils/endpoint-utils';
import CustomizationRepository from '../repositories/customization.repository';

export const CustomizationController: Router = Router();

const customizationRepository = new CustomizationRepository();

CustomizationController.put('/', async (req: Request, res: Response) => {
  const { customization } = req.body;

  if (!customization) return sendError(res, HTTP_STATUS.BAD, 'Please provide all the information required for the customization');

  try {
    await customizationRepository.updateCustomization(customization as Customization);
    return sendResponse(res, HTTP_STATUS.OK, { message: 'Sucessfully updated' });
  } catch (err: unknown) {
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Something went wrong while trying to update Customization');
  }
});

CustomizationController.get('/', async (req: Request, res: Response) => {
  const user = getUser(req);

  if (!user) return sendError(res, HTTP_STATUS.BAD, 'No user found');
  try {
    const customization = await customizationRepository.findByUserId(user._id!);
    return sendResponse(res, HTTP_STATUS.OK, { data: customization });
  } catch (err) {
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Something went wrong trying to retrieve intents..');
  }
});

export default CustomizationController;
