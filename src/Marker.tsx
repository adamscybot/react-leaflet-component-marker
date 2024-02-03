import React, {
  useState,
  useId,
  useMemo,
  type ReactElement,
  useCallback,
  isValidElement,
  type ComponentType,
  useLayoutEffect,
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
  type PointExpression,
  type DivIconOptions,
} from 'leaflet'
import { getCoordsFromPointExpression } from './utils'

type BaseMarkerProps<AdditionalIconTypes = never> = Omit<
  ReactLeafletMarkerProps,
  'icon'
> & {
  /** A {@link ReactElement} representing the Markers icon, or any type from [react-leaflet Marker](https://react-leaflet.js.org/docs/api-components/#marker) component. */
  icon: ReactElement | AdditionalIconTypes

  /**
   * The {@link DivIconOptions} (except for the `html` property and properties that are not relevant in the context of a React driven marker) that are to be supplied to the `div` wrapper for the leaflet-managed wrapper of the React icon component.
   *
   * By default, `iconSize` is set to `[0,0]`, which is useful when combined with an "auto" `iconComponentSize` in order to allow for dynamically sized React icon markers.
   *
   * Typically, it is not necessary to override these options, and doing so may lead to unexpected results for some properties.
   *
   * These options are only effective when a React element/component is being used for the `icon` prop.
   **/
  iconComponentOpts?: Omit<
    DivIconOptions,
    'html' | 'bgPos' | 'shadowAnchor' | 'shadowRetinaUrl'
  >

  /**
   * `"fit-content"` disregards the `iconSize` passed to leaflet (defaults to `[0,0]`) and allows the React icon marker to be determined by the size of the provided component itself (which could be dynamic). Automatic alignment compensation is
   * added to ensure the icon component stays centred on the X axis with the marker.
   *
   * `'fit-parent'` will set the container of the component to be the same size as the `iconSize`. Typically, this is used alongside a static `iconSize` that is passed via `iconComponentOpts`. This setup may allow for more granular control over positioning and anchor configuration. The user supplied Icon component itself should have a root element that has 100% width and height.
   *
   * This option is not effective if `icon` is not a React element/component.
   *
   * @defaultValue `"fit-content"`
   */
  iconComponentLayout: 'fit-content' | 'fit-parent'
}
export type MarkerProps = BaseMarkerProps<
  ReactLeafletMarkerProps['icon'] | ComponentType
>

const DEFAULT_ICON_SIZE: PointExpression = [0, 0]
const ComponentMarker = ({
  eventHandlers: providedEventHandlers,
  icon: providedIcon,
  iconComponentOpts = {},
  iconComponentLayout = 'fit-content',
  ...otherProps
}: BaseMarkerProps) => {
  const [markerRendered, setMarkerRendered] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [changeCount, setChangeCount] = useState(0)
  const id = 'marker-' + useId()

  const {
    attribution,
    className,
    iconAnchor,
    iconSize = DEFAULT_ICON_SIZE,
    pane,
    popupAnchor,
    tooltipAnchor,
  } = iconComponentOpts

  const iconDeps = [
    id,
    iconComponentLayout,
    attribution,
    className,
    pane,
    ...getCoordsFromPointExpression(iconSize),
    ...getCoordsFromPointExpression(iconAnchor),
    ...getCoordsFromPointExpression(popupAnchor),
    ...getCoordsFromPointExpression(tooltipAnchor),
  ]

  const icon = useMemo(() => {
    const parentStyles =
      iconComponentLayout === 'fit-content'
        ? 'width: min-content; transform: translateX(-50%)'
        : 'width: 100%; height: 100%'
    return divIcon({
      html: `<div style="${parentStyles}" id="${id}"></div>`,
      ...(iconSize ? { iconSize } : []),
      ...(iconAnchor ? { iconAnchor } : []),
      ...(popupAnchor ? { popupAnchor } : []),
      ...(tooltipAnchor ? { tooltipAnchor } : []),
      pane,
      attribution,
      className,
    })
  }, iconDeps)

  useLayoutEffect(() => {
    setChangeCount((prev) => prev + 1)
  }, [icon])

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
        createPortal(providedIcon, portalTarget, JSON.stringify(iconDeps))}
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
