/**
 * Explicit success or failure, used where a caller has to branch on the outcome rather than let a
 * rejection bubble, such as sign-in driving its own form state.
 */
export type Result<T, E> = { success: true; data: T } | { success: false; error: E }

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data })

export const err = <E>(error: E): Result<never, E> => ({ success: false, error })
