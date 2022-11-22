import Logger from '../utils/Logger';
import type { ID } from '../models/base.model';
import type { Intent } from '../models/intents.model';
import Repository from './base.repository';

export default class IntentsRepository extends Repository<Intent> {
  public async findByUserId(userId: ID): Promise<Intent[]> {
    let intents: Intent[] = [];
    try {
      intents = (await this.collection.find({ userId }).toArray()) as Intent[];
    } catch (error) {
      Logger.log(error);
    }
    return intents;
  }

  public async addOrUpdateIntent(userId: ID, intent: Intent): Promise<boolean> {
    const exists = await this.exists(intent);
    if (!exists) {
      try {
        await this.insert(intent);
        return true;
      } catch (err) {
        Logger.error(err);
        return false;
      }
    }

    try {
      const filter = {
        $set: {
          tag: intent.tag,
          patterns: intent.patterns,
          responses: intent.responses,
        },
      };
      await this.collection.replaceOne({ userId: this.parseId(userId) }, filter);
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  public async deleteIntent(intentId: ID): Promise<boolean> {
    try {
      this.delete(intentId);
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  private async exists(intent: Intent): Promise<boolean> {
    const query = { userId: intent.userId, tag: intent.tag };

    const foundIntent = await this.collection.findOne(query);
    return foundIntent !== null;
  }
}
