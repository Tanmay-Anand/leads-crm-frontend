/**
 * Turns a Cognito error into something worth showing a user.
 *
 * Cognito names are precise but unreadable, and a couple of them leak information we would rather
 * not confirm: UserNotFoundException tells an attacker the address is not registered, so it is
 * folded into the same message as a wrong password.
 */
export const toAuthErrorMessage = (error: unknown): string => {
  const name = (error as { name?: string })?.name

  switch (name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "Incorrect email or password."
    case "UserNotConfirmedException":
      return "This account is not confirmed yet. Check your email for the confirmation link."
    case "PasswordResetRequiredException":
      return "Your password must be reset before you can sign in."
    case "TooManyRequestsException":
    case "LimitExceededException":
      return "Too many attempts. Wait a moment and try again."
    case "InvalidParameterException":
      return "Those details do not look right. Check them and try again."
    case "NetworkError":
      return "Could not reach the sign-in service. Check your connection."
    default:
      return (error as { message?: string })?.message ?? "Could not sign you in. Please try again."
  }
}
