import { computed, effect, signal } from "@angular/core"

// The component each controller is attached to, read by parts outside it.
// `version` changes with every registration, so a part that reads a
// controller with no component yet binds once it registers.
const controlled = new WeakMap<object, unknown>()
const version = signal(0)

// The component a part connects to: the one its controller is attached to,
// from anywhere on the page, or else `nearest`, the one it sits in.
function useControllerTarget<T>(
  controller: () => object | undefined,
  nearest: T | undefined
) {
  return computed(() => {
    const current = controller()
    if (!current) {
      return nearest
    }
    version()
    return (controlled.get(current) as T | undefined) ?? nearest
  })
}

// Registers a popup with its controller, on the server too, so a trigger
// outside is in the server's HTML with its id and ARIA.
function useControllerEntry(
  controller: () => object | undefined,
  value: unknown
) {
  effect((onCleanup) => {
    const current = controller()
    if (!current) {
      return
    }
    controlled.set(current, value)
    version.update((count) => count + 1)
    onCleanup(() => {
      if (controlled.get(current) !== value) {
        return
      }
      controlled.delete(current)
      version.update((count) => count + 1)
    })
  })
}

export { useControllerEntry, useControllerTarget }
