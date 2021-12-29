import {UserService} from '@loopback/authentication';
import {Credentials} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';
import {PasswordHasherBindings} from '../keys';
import {Role, User, UserWithPassword} from '../models';
import {RoleRepository, UserRepository} from '../repositories';
import {PasswordHasher} from './hash.password.bcryptjs';

export class UserManagementService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(RoleRepository)
    public roleRepository: RoleRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const {email, password} = credentials;
    const invalidCredentialsError = 'Invalid email or password.';
    if (!email) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const foundUser = await this.userRepository.findOne({
      where: {email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await this.passwordHasher.comparePassword(
      password,
      credentialsFound.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.firstName) userName = `${user.firstName}`;
    if (user.lastName)
      userName = user.firstName
        ? `${userName} ${user.lastName}`
        : `${user.lastName}`;
    const userId: any = user.id;
    return {
      [securityId]: userId.toString(),
      name: userName,
      id: user.id,
      role: '',
      permissions: [],
    };
  }

  async createUser(userWithPassword: UserWithPassword): Promise<User> {
    const password = await this.passwordHasher.hashPassword(
      userWithPassword.password,
    );
    userWithPassword.password = password;
    const user = await this.userRepository.create(
      _.omit(userWithPassword, 'password'),
    );

    await this.userRepository.userCredentials(user.id).create({password});
    return user;
  }
  async getUserRole(roleId: number): Promise<Role> {
    try {
      return this.roleRepository.findById(roleId);
    } catch (error) {
      throw new HttpErrors.ExpectationFailed();
    }
  }
}
