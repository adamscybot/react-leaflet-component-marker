import React, {
  useState,
  useId,
  useMemo,
  type ReactElement,
  useCallback,
  isValidElement,
  type ComponentType,
} from 'react'
import { isValidElementType } from 'react-is'
import { createPortal } from 'react-dom'
import {
  Marker as ReactLeafletMarker,
  type MarkerProps as ReactLeafletMarkerProps,
} from 'react-leaflet'
import {
  type LeafletEventHandlerFn,
  type LeafletEventHandlerFnMap,
  divIcon,
} from 'leaflet'

export type MarkerProps = Omit<ReactLeafletMarkerProps, 'icon'> & {
  /** A {@link ReactElement} representing the Markers icon, or any type from [react-leaflet Marker](https://react-leaflet.js.org/docs/api-components/#marker) component. */
  icon: ReactElement | ComponentType | ReactLeafletMarkerProps['icon']
}

const ComponentMarker = ({
  eventHandlers: providedEventHandlers,
  icon: providedIcon,
  ...otherProps
}: Omit<ReactLeafletMarkerProps, 'icon'> & { icon: ReactElement }) => {
  const [markerRendered, setMarkerRendered] = useState(false)
  const id = 'marker-' + useId()

  const icon = useMemo(
    () =>
      divIcon({
        html: `<div id="${id}"></div>`,
      }),
    [id],
  )

  const handleAddEvent = useCallback<LeafletEventHandlerFn>(
    (...args) => {
      setMarkerRendered(true)
      if (providedEventHandlers?.add) providedEventHandlers.add(...args)
    },
    [providedEventHandlers?.add],
  )

  const handleRemoveEvent = useCallback<LeafletEventHandlerFn>(
    (...args) => {
      setMarkerRendered(false)
      if (providedEventHandlers?.remove) providedEventHandlers.remove(...args)
    },
    [providedEventHandlers?.remove],
  )

  const eventHandlers = useMemo<LeafletEventHandlerFnMap>(
    () => ({
      ...providedEventHandlers,
      add: handleAddEvent,
      remove: handleRemoveEvent,
    }),
    [providedEventHandlers, handleAddEvent, handleRemoveEvent],
  )

  let portalTarget: null | HTMLElement = null
  if (markerRendered) {
    portalTarget = document.getElementById(id)
    if (portalTarget === null) {
      throw new Error(
        `[react-leaflet-component-marker] Expected marker with id '${id}' to be rendered, but none was found.`,
      )
    }
  }

  return (
    <>
      <ReactLeafletMarker
        {...otherProps}
        eventHandlers={eventHandlers}
        icon={icon}
      />
      {markerRendered &&
        portalTarget !== null &&
        createPortal(providedIcon, portalTarget)}
    </>
  )
}

/**
 * A modified version of the [react-leaflet Marker](https://react-leaflet.js.org/docs/api-components/#marker) component that is extended such that it allows a {@link ReactElement} to be used as the icon.
 *
 * @example
 * Basic usage:
 * ```
 * // Define marker component
 * const MarkerIconExample = () => {
 *   return (
 *    <>
 *      <button onClick={() => console.log("button 1 clicked")}>Button 1</button>
 *      <button onClick={() => console.log("button 2 clicked")}>Button 2</button>
 *    </>
 *   )
 * }
 *
 * // Use marker component
 * <Marker position={[51.505, -0.091]} icon={<MarkerIconExample />} />
 * ```
 **/
export const Marker = ({ icon: Icon, ...otherProps }: MarkerProps) => {
  if (isValidElement(Icon)) {
    return <ComponentMarker icon={Icon} {...otherProps} />
  }

  if (isValidElementType(Icon)) {
    return <ComponentMarker icon={<Icon />} {...otherProps} />
  }

  return (
    <ReactLeafletMarker
      icon={Icon as ReactLeafletMarkerProps['icon']}
      {...otherProps}
    />
  )
}
