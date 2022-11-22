import type { Collection, Db, Document, UpdateFilter } from 'mongodb';
import { ObjectId } from 'mongodb';
import { MongoClient } from 'mongodb';
import { db } from '../app';
import { env_variables } from '../config';
import type { ID } from '../models/base.model';
import Logger from '../utils/Logger';

type availableRepos = 'user' | 'intent' | 'customization';

interface IRead<T> {
  findById: (id: string) => Promise<T | null>;
  findAll: () => Promise<T[] | null>;
}
interface IWrite<T> {
  insert: (item: T) => Promise<boolean>;
  update: (id: string, item: T) => Promise<boolean>;
  delete: (id: string) => Promise<boolean>;
}

export default abstract class BaseRepository<T> implements IRead<T>, IWrite<T> {
  protected database: Db;
  protected client: MongoClient;
  protected collection: Collection;

  constructor(collectionName: availableRepos) {
    this.database = db;
    this.client = new MongoClient(env_variables.DATABASE.url);
    this.collection = this.client.db().collection(collectionName);
  }

  async findById<T>(id: ID): Promise<T | null> {
    try {
      const response = await this.collection.findOne<T>({ _id: this.parseId(id) });
      return response;
    } catch (err) {
      return this.handleError(err);
    }
  }

  async findAll(): Promise<Array<T> | null> {
    try {
      const response = this.collection.find({}).toArray() as Promise<Array<T>>;
      return response;
    } catch (err) {
      return this.handleError(err);
    }
  }

  async insert(item: Partial<T>): Promise<boolean> {
    try {
      await this.collection.insertOne(item as Document);
      return true;
    } catch (err) {
      this.handleError(err);
      return false;
    }
  }

  async update(id: ID, item: Partial<T>): Promise<boolean> {
    try {
      await this.collection.replaceOne({ _id: this.parseId(id) }, item as UpdateFilter<Document>);
      return true;
    } catch (err) {
      this.handleError(err);
      return false;
    }
  }

  async delete(id: ID): Promise<boolean> {
    try {
      await this.collection.findOneAndDelete({ _id: this.parseId(id) });
      return true;
    } catch (err) {
      this.handleError(err);
      return false;
    }
  }

  protected handleError(error: unknown): null {
    Logger.error('Error while tryinf to do DB operation:');
    Logger.error(error);
    return null;
  }

  protected parseId(id: ID): ObjectId {
    return new ObjectId(id);
  }
}
