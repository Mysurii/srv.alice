import { ObjectId, UpdateFilter } from 'mongodb';
import type { Customization } from './../models/customization.model';
import Logger from '../utils/Logger';
import type { ID } from '../models/base.model';
import Repository from './base.repository';
import { ObjectID } from 'bson';

export default class CustomizationRepository extends Repository<Customization> {
  constructor() {
    super('customization');
  }

  public async findByUserId(userId: ID): Promise<Customization | null> {
    console.log(userId);
    try {
      const customization = (await this.collection.findOne({ userId: this.parseId(userId) })) as Customization;
      console.log(customization);
      return customization;
    } catch (error) {
      Logger.log(error);
      return null;
    }
  }

  public async addCustomization(customization: Customization): Promise<boolean> {
    try {
      await this.insert(customization);
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  public async updateCustomization(customization: Customization): Promise<boolean> {
    try {
      const filter = {
        $set: {
          name: customization.name,
          nameColor: customization.nameColor,
          header: customization.header,
          close: customization.close,
          messagesList: customization.messagesList,
          bubbleUser: customization.bubbleUser,
          textUser: customization.textUser,
          bubbleBot: customization.bubbleBot,
          textBot: customization.textBot,
          avatar: customization.avatar,
          sendButton: customization.sendButton,
        },
      };
      const parsedId = this.parseId(customization._id);
      await this.collection.updateOne({ _id: parsedId }, filter);
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }

  public async deleteCustomization(userId: ID): Promise<boolean> {
    try {
      this.delete(this.parseId(userId));
      return true;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  }
}
