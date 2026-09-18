import type { PermissionState } from "../domain/permission.types"
import type { MeResponse } from "../infrastructure/api/authorization.service"

/** Turns a `/me` read (plus its own loading flag) into the discriminated state every gate uses. */
export const toPermissionState = (me: MeResponse | undefined, isLoading: boolean): PermissionState => {
  if (isLoading) return { status: "loading" }
  if (!me) return { status: "unauthenticated" }
  if (me.unrestricted) return { status: "unrestricted" }
  return { status: "restricted", permissions: me.permissions }
}
