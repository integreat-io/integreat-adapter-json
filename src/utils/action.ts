import type { Action } from 'integreat'

/**
 * Set error message and status on an action.
 */
export function setErrorOnAction(
  action: Action,
  error: string,
  status = 'error',
): Action {
  return {
    ...action,
    response: {
      ...action.response,
      status,
      error,
    },
  }
}
