import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import {securityId, UserProfile} from '@loopback/security';
import _ from 'lodash';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.

export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  // No access if authorization details are missing
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], [
      'id',
      'name',
      'role',
      'permissions',
    ]);
    currentUser = {
      [securityId]: user.id,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };
  } else {
    return AuthorizationDecision.DENY;
  }

  if (!currentUser.role) {
    return AuthorizationDecision.DENY;
  }

  // Authorize everything that does not have a allowedRoles property
  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }
  if (!currentUser.permissions.includes(metadata.resource)) {
    return AuthorizationDecision.DENY;
  }
  let roleIsAllowed = false;

  if (metadata.allowedRoles.includes(currentUser.role)) {
    roleIsAllowed = true;
  }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  }

  // Admin and support accounts bypass id verification
  if (currentUser.role === 'admin' || currentUser.role === 'support') {
    return AuthorizationDecision.ALLOW;
  }

  /**
   * Allow access only to model owners, using route as source of truth
   *
   * eg. @post('/users/{userId}/orders', ...) returns `userId` as args[0]
   */
  if (currentUser[securityId] == authorizationCtx.invocationContext.args[0]) {
    return AuthorizationDecision.ALLOW;
  }

  return AuthorizationDecision.DENY;
}
