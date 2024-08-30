import {
  type LeafletEventHandlerFn,
  type LeafletEventHandlerFnMap,
} from 'leaflet'
import { useCallback, useMemo } from 'react'

type UseLeafletMarkerLifecycleEventsOpts = {
  /** Callback to be fired when leaflet has injected DOM for root `divIcon` */
  onRemove: () => void
  /** Callback to be fired when leaflet has removed DOM for root `divIcon` */
  onAdd: () => void
}

/**
 * Leaflet performs DOM mutations in an imperative way, outside of the React
 * lifecycle. `useLayoutEffect` is therefore not sufficient to defer processing
 * until after the marker DOM is created/removed.
 *
 * This convenience hook enhances a user provided event handler map (optional)
 * such that the provided add/remove callbacks are called when Leaflet fires
 * those events.
 *
 * Existing user provided event handlers are automatically composed.
 *
 * @param providedHandlers  `undefined` if no user provided handlers,
 *                          otherwise the existing map to compose.
 * @param opts              Object containing callbacks to be fired for the
 *                          add and remove events.
 * @returns Composed event handler map to be passed to react-leaflets
 *          `eventHandlers` prop.
 */
export const useLeafletMarkerLifecycleEvents = (
  providedHandlers: LeafletEventHandlerFnMap | undefined,
  { onRemove, onAdd }: UseLeafletMarkerLifecycleEventsOpts,
) => {
  const { add: providedAdd, remove: providedRemove } = providedHandlers ?? {}

  const handleAddEvent = useCallback<LeafletEventHandlerFn>(
    (...args) => {
      onAdd()
      if (providedAdd) providedAdd(...args)
    },
    [providedAdd, onAdd],
  )

  const handleRemoveEvent = useCallback<LeafletEventHandlerFn>(
    (...args) => {
      onRemove()
      if (providedRemove) providedRemove(...args)
    },
    [providedRemove, onRemove],
  )

  return useMemo<LeafletEventHandlerFnMap>(
    () => ({
      ...providedHandlers,
      add: handleAddEvent,
      remove: handleRemoveEvent,
    }),
    [providedHandlers, handleAddEvent, handleRemoveEvent],
  )
}
