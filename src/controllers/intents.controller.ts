import type { Request, Response } from 'express';
import { Router } from 'express';
import type { Intent } from '../models/intents.model';
import IntentsRepository from '../repositories/intents.repository';
import { HTTP_STATUS, sendResponse } from '../utils/endpoint-utils';
import { sendError } from '../utils/endpoint-utils';

export const IntentsController: Router = Router();

const intentsRepository = new IntentsRepository('intent');

// Adding and updating an intent use the same repo function
IntentsController.post('/:userId', addOrUpdate).put('/:userId', addOrUpdate);

IntentsController.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const intents = await intentsRepository.findByUserId(userId);
    return sendResponse(res, HTTP_STATUS.OK, { data: intents });
  } catch (err) {
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Something went wrong trying to retrieve intents..');
  }
});

IntentsController.delete('/:intentsId', async (req: Request, res: Response) => {
  const { intentsId } = req.params;

  const isDeleted = intentsRepository.deleteIntent(intentsId);

  if (!isDeleted) return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Could not delete the item with the given id');

  return sendResponse(res, HTTP_STATUS.OK, {
    success: true,
    message: 'Successfully deleted intent',
  });
});

async function addOrUpdate(req: Request, res: Response) {
  const { userId } = req.params;

  const { tag, patterns, responses, followUpQuestions } = req.body;

  if (!tag || !patterns || !responses) return sendError(res, HTTP_STATUS.BAD, 'Please provide all the information required for creating an intent');

  const intent = {
    tag,
    patterns,
    responses,
    userId,
    followUpQuestions,
  } as Intent;

  const success = await intentsRepository.addOrUpdateIntent(userId, intent);

  if (!success) return sendError(res, HTTP_STATUS.INTERNAL_SERVER, 'Something went wrong with saving the intent');

  return sendResponse(res, HTTP_STATUS.CREATED, {
    message: 'success',
  });
}

export default IntentsController;
