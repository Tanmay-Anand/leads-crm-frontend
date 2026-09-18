import { Fragment } from "react"

import { titleCase } from "@/shared/lib/utils"
import { Checkbox } from "@/shared/ui/checkbox"

import type { PermissionCatalogResource, PermissionCatalogResponse } from "../../domain/types"

interface ResourceNode {
  key: string
  label: string
  /** Actions this node itself carries a real permission for - empty for a synthetic group node
   *  like "master-data", which exists only because its children share that prefix. */
  actions: string[]
  children: ResourceNode[]
}

/**
 * Groups catalogue entries one level deeper than a top-level resource under a synthetic parent
 * node keyed by their shared prefix (e.g. "master-data/lead-statuses" and "master-data/tags" both
 * group under "master-data"), since the catalogue itself only lists real, permission-bearing
 * resources - "master-data" is never one of them.
 */
function buildTree(resources: PermissionCatalogResource[]): ResourceNode[] {
  const topLevel: ResourceNode[] = []
  const groups = new Map<string, ResourceNode>()

  for (const resource of resources) {
    const segments = resource.key.split("/")
    if (segments.length === 1) {
      topLevel.push({ key: resource.key, label: titleCase(resource.key), actions: resource.actions, children: [] })
      continue
    }

    const groupKey = segments.slice(0, -1).join("/")
    let group = groups.get(groupKey)
    if (!group) {
      // The last segment, not split("/")[1] - the reference bug this fixes returns the wrong
      // segment past one level of nesting.
      const groupLabel = groupKey.split("/").pop() ?? groupKey
      group = { key: groupKey, label: titleCase(groupLabel), actions: [], children: [] }
      groups.set(groupKey, group)
      topLevel.push(group)
    }
    group.children.push({
      key: resource.key,
      label: titleCase(resource.key.split("/").pop() ?? resource.key),
      actions: resource.actions,
      children: []
    })
  }

  return topLevel
}

/** Every `action:key` permission string this node's cell for `action` represents - itself, if it
 *  carries that action, plus every applicable descendant. */
const collectPermissions = (node: ResourceNode, action: string): string[] => [
  ...(node.actions.includes(action) ? [`${action}:${node.key}`] : []),
  ...node.children.flatMap(child => collectPermissions(child, action))
]

type CellState = "checked" | "unchecked" | "indeterminate" | "none"

const cellState = (node: ResourceNode, action: string, held: ReadonlySet<string>): CellState => {
  const applicable = collectPermissions(node, action)
  if (applicable.length === 0) return "none"
  const heldCount = applicable.filter(permission => held.has(permission)).length
  if (heldCount === 0) return "unchecked"
  if (heldCount === applicable.length) return "checked"
  return "indeterminate"
}

interface PermissionMatrixProps {
  catalog: PermissionCatalogResponse
  permissions: string[]
  onChange: (permissions: string[]) => void
  readOnly?: boolean
}

/**
 * Fixes two reference bugs:
 *
 * 1. There, a parent's `checked` derives from its own permission plus its children's, but
 *    `toggleResource` only ever toggles the parent's *own* action - so a parent showing
 *    indeterminate because of its children can never be cleared by clicking it. Here, toggling a
 *    cell always applies to every permission that cell's state was computed from (the node itself,
 *    if applicable, plus every applicable descendant) - clicking an indeterminate cell clears it in
 *    one click, the same as clicking a checked one.
 * 2. There, a child's label comes from `child.key.split("/")[1]`, which is the wrong segment past
 *    one level of nesting. Here it is always the last segment (`buildTree` above).
 */
export function PermissionMatrix({ catalog, permissions, onChange, readOnly }: PermissionMatrixProps) {
  const held = new Set(permissions)
  const tree = buildTree(catalog.resources)

  const toggle = (node: ResourceNode, action: string, nextChecked: boolean) => {
    const applicable = new Set(collectPermissions(node, action))
    const kept = permissions.filter(permission => !applicable.has(permission))
    onChange(nextChecked ? [...kept, ...applicable] : kept)
  }

  const renderRow = (node: ResourceNode, depth: number) => (
    <Fragment key={node.key}>
      <tr className="border-b last:border-0">
        <td className="py-2 pr-4 text-sm font-medium" style={{ paddingLeft: depth * 16 }}>
          {node.label}
        </td>
        {catalog.actions.map(action => {
          const state = cellState(node, action, held)
          if (state === "none") return <td key={action} />
          return (
            <td key={action} className="text-center">
              <Checkbox
                checked={state === "indeterminate" ? "indeterminate" : state === "checked"}
                disabled={readOnly}
                onCheckedChange={checked => toggle(node, action, checked === true)}
              />
            </td>
          )
        })}
      </tr>
      {node.children.map(child => renderRow(child, depth + 1))}
    </Fragment>
  )

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">Resource</th>
          {catalog.actions.map(action => (
            <th key={action} className="text-muted-foreground px-2 py-2 text-center text-xs font-medium">
              {titleCase(action)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{tree.map(node => renderRow(node, 0))}</tbody>
    </table>
  )
}
