import type { ID } from './../models/base.model';
import type { User } from '../models/user.model';
import BaseRepository from './base.repository';

export default class UserRepository extends BaseRepository<User> {
  constructor() {
    super('user');
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.collection.findOne<User>({ email });
    return user;
  }

  public async getUserById(id: ID): Promise<User | null> {
    return this.findById(id);
  }
  public async getAllUsers(): Promise<User[] | null> {
    return this.findAll();
  }
  public async addUser(user: Partial<User>): Promise<boolean> {
    return this.insert(user);
  }
  public async updateUser(user: User): Promise<boolean> {
    return this.update(user._id, user);
  }
  public async deleteUser(id: ID): Promise<boolean> {
    return this.delete(id);
  }
}
