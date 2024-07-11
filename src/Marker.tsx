import React, {
  useState,
  useId,
  useMemo,
  type ReactElement,
  useCallback,
  isValidElement,
  type ComponentType,
  useLayoutEffect,
  forwardRef,
  useEffect,
} from 'react'
import { isValidElementType } from 'react-is'
import { createPortal } from 'react-dom'
import {
  Marker as ReactLeafletMarker,
  type MarkerProps as ReactLeafletMarkerProps,
} from 'react-leaflet'
import {
  divIcon,
  DomEvent,
  type LeafletEventHandlerFn,
  type LeafletEventHandlerFnMap,
  type PointExpression,
  type DivIconOptions,
  type Marker as LeafletMarker,
} from 'leaflet'
import { type SetRequired } from 'type-fest'
import { createHtmlPortalNode, OutPortal, InPortal } from 'react-reverse-portal'

import { useCoordsFromPointExpression } from './lib/useCoordsFromPointExpression'
import { logCodedString } from './lib/logging'

/**
 * The possible options for the  {@link ComponentMarkerOpts.layoutMode | `componentIconOpts.layoutMode`} option.
 **/
export type ComponentMarkerLayout = 'fit-content' | 'fit-parent'

export type ComponentMarkerRootDivIconOpts = Omit<
  DivIconOptions,
  | 'html'
  | 'bgPos'
  | 'shadowUrl'
  | 'shadowSize'
  | 'shadowAnchor'
  | 'shadowRetinaUrl'
  | 'iconUrl'
  | 'iconRetinaUrl'
>

type RootDivOpt<
  RequiredKeys extends keyof ComponentMarkerRootDivIconOpts = never,
> = {
  /**
   * The {@link DivIconOptions} (except for the `html` property and other properties that are not relevant in the context of a React driven marker) that are to be supplied to the `div` wrapper for the leaflet-managed wrapper of the React icon component.
   *
   * When setting  {@link ComponentMarkerOpts.layoutMode | `componentIconOpts.layoutMode`} as `'fit-parent'`, it is expected that {@link ComponentMarkerRootDivIconOpts.iconSize | `componentIconOpts.rootDivOpts.iconSize`} is set since this defines the dimensions of the component in this mode.
   *
   * @see {@link ComponentMarkerRootDivIconOpts}
   **/
  rootDivOpts: SetRequired<ComponentMarkerRootDivIconOpts, RequiredKeys>
}

type CoreComponentMarkerOpts = {
  /**
   * `'fit-content'` disregards the `iconSize` passed to leaflet (defaults to `[0,0]`) and allows the React icon marker to be determined by the size of the provided component itself (which could be dynamic). Automatic alignment compensation is
   * added to ensure the icon component stays centred on the X axis with the marker.
   *
   * `'fit-parent'` will set the container of the component to be the same size as the `iconSize`. Typically, this is used alongside a static icon size that is passed via {@link ComponentMarkerRootDivIconOpts.iconSize | `componentIconOpts.rootDivOpts.iconSize`}. This setup may allow for more granular control over positioning and anchor configuration. The user supplied Icon component itself should use a width and height of `100%` to fill the container.
   *
   * @defaultValue `"fit-content"`
   * @see {@link ComponentMarkerLayout}
   */
  layoutMode?: ComponentMarkerLayout

  /**
   * If set to `true`, panning/scrolling the map will not be possible "through" the component marker.
   *
   * This applies to the entire component marker.
   *
   * @defaultValue `false`
   */
  disableScrollPropagation?: boolean

  /**
   * If set to `true`, clicking on the component marker will not be captured by the underlying map.
   *
   * This applies to the entire component marker. Note this will also disable the ability to activate native react-leaflet
   * popups via clicking.
   *
   * @defaultValue `false`
   */
  disableClickPropagation?: boolean

  /**
   * Enable or disable the console warning about the case where the {@link BaseMarkerProps.componentIconOpts | `componentIconOpts`} prop was set but the {@link BaseMarkerProps.icon | `icon`} prop
   * is not a component. This would mean those options are unused.
   *
   * @defaultValue `true`
   * @see {@link BaseMarkerProps.componentIconOpts}
   */
  unusedOptsWarning?: boolean

  /**
   * Enable or disable the console warning about the case where {@link ComponentMarkerOpts.layoutMode | `componentIconOpts.layoutMode`} was set to `fit-parent` but the {@link ComponentMarkerRootDivIconOpts.iconSize | `componentIconOpts.rootDivOpts.iconSize`}
   * has not been set. This would mean the size of the React component icon would not be visible.
   *
   * @defaultValue `true`
   * @see {@link ComponentMarkerOpts.rootDivOpts}
   * @see {@link ComponentMarkerRootDivIconOpts.iconSize}
   */
  rootSizeWarning?: boolean
}

type UnionKeys<T> = T extends T ? keyof T : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
  : never
type StrictUnion<T> = StrictUnionHelper<T, T>

export type ComponentMarkerOpts = StrictUnion<
  | (CoreComponentMarkerOpts & {
      layoutMode?: 'fit-content'
    } & Partial<RootDivOpt>)
  | (CoreComponentMarkerOpts & {
      layoutMode: 'fit-parent'
    } & RootDivOpt<'iconSize'>)
>

type BaseMarkerProps<AdditionalIconTypes = never> = Omit<
  ReactLeafletMarkerProps,
  'icon'
> & {
  /** A {@link ReactElement} representing the Markers icon, or any type from [react-leaflet Marker](https://react-leaflet.js.org/docs/api-components/#marker) component. */
  icon: ReactElement | AdditionalIconTypes

  /**
   * The {@link ComponentMarkerOpts}. These will not be effective if {@link BaseMarkerProps.icon | `icon`} is not set to a React Element or Component, and a warning will be given in the console.
   *
   * @see {@link ComponentMarkerOpts.unusedOptsWarning}
   */
  componentIconOpts?: ComponentMarkerOpts
}

export type MarkerProps = BaseMarkerProps<
  ReactLeafletMarkerProps['icon'] | ComponentType
>

const DEFAULT_ICON_SIZE: PointExpression = [0, 0]
const ComponentMarker = forwardRef<LeafletMarker, BaseMarkerProps>(
  (
    {
      eventHandlers: providedEventHandlers,
      icon: providedIcon,

      componentIconOpts: {
        layoutMode = 'fit-content',
        disableClickPropagation,
        disableScrollPropagation,
        rootDivOpts,
        rootSizeWarning,
      } = {},
      ...otherProps
    },
    ref,
  ) => {
    const [markerRendered, setMarkerRendered] = useState(false)
    const [, setChangeCount] = useState(0)
    const id = 'marker-' + useId()

    const portalNode = React.useMemo(
      () =>
        createHtmlPortalNode({
          attributes: {
            'data-react-component-marker': 'portal-parent',
            style: 'width:100%;height:100%;',
          },
        }),
      [],
    )

    useEffect(() => {
      if (
        rootSizeWarning !== false &&
        layoutMode === 'fit-parent' &&
        rootDivOpts?.iconSize === undefined
      ) {
        console.warn(
          logCodedString(
            'UNBOUND_FIT_PARENT',
            `The 'componentIconOpts.rootDivOpts.iconSize' option was not set but 'componentIconOpts.layoutMode' was set to 'fit-parent'. This means your React component will not be properly bound by the parent.
        
To disable this warning set 'componentIconOpts.rootSizeWarning' to false.`,
          ),
        )
      }
    }, [layoutMode, rootSizeWarning, rootDivOpts?.iconSize])

    const {
      attribution,
      className,
      iconAnchor,
      iconSize = DEFAULT_ICON_SIZE,
      pane,
      popupAnchor,
      tooltipAnchor,
    } = rootDivOpts ?? {}

    const iconDeps = [
      id,
      layoutMode,
      attribution,
      className,
      pane,
      Boolean(disableClickPropagation),
      Boolean(disableScrollPropagation),
      ...useCoordsFromPointExpression(iconSize),
      ...useCoordsFromPointExpression(iconAnchor),
      ...useCoordsFromPointExpression(popupAnchor),
      ...useCoordsFromPointExpression(tooltipAnchor),
    ]

    const icon = useMemo(() => {
      const parentStyles =
        layoutMode === 'fit-content'
          ? 'width: min-content; transform: translate(-50%, -50%)'
          : 'width: 100%; height: 100%'

      return divIcon({
        html: `<div data-react-component-marker="root" style="${parentStyles}" id="${id}"></div>`,
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
    }

    useEffect(() => {
      if (!portalTarget) return

      if (disableClickPropagation) {
        DomEvent.disableClickPropagation(portalTarget)
      }

      if (disableScrollPropagation) {
        DomEvent.disableScrollPropagation(portalTarget)
      }
    }, [portalTarget, disableClickPropagation, disableScrollPropagation])

    return (
      <>
        <ReactLeafletMarker
          ref={ref}
          {...otherProps}
          eventHandlers={eventHandlers}
          icon={icon}
        />

        {markerRendered && portalTarget !== null && (
          <>
            <InPortal node={portalNode}>{providedIcon}</InPortal>
            {createPortal(<OutPortal node={portalNode} />, portalTarget)}
          </>
        )}
      </>
    )
  },
)

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
export const Marker = forwardRef<LeafletMarker, MarkerProps>(
  ({ icon: Icon, componentIconOpts, ...otherProps }, ref) => {
    const validElement = isValidElement(Icon)
    const validComponent = isValidElementType(Icon)

    useEffect(() => {
      if (
        !validElement &&
        !validComponent &&
        componentIconOpts !== undefined &&
        componentIconOpts.unusedOptsWarning !== false
      ) {
        console.warn(
          logCodedString(
            'UNUSED_OPTIONS',
            `The 'componentIconOpts' prop was set but the 'icon' prop was not set to a React component or element. These options will be unused.
        
  To disable this warning set 'componentIconOpts.unusedOptsWarning' to false.`,
          ),
        )
      }
    }, [
      componentIconOpts,
      componentIconOpts?.unusedOptsWarning,
      validElement,
      validComponent,
    ])

    if (validElement) {
      return (
        <ComponentMarker
          ref={ref}
          icon={Icon}
          componentIconOpts={componentIconOpts}
          {...otherProps}
        />
      )
    }

    if (validComponent) {
      return (
        <ComponentMarker
          ref={ref}
          icon={<Icon />}
          componentIconOpts={componentIconOpts}
          {...otherProps}
        />
      )
    }

    return (
      <ReactLeafletMarker
        ref={ref}
        icon={Icon as ReactLeafletMarkerProps['icon']}
        {...otherProps}
      />
    )
  },
)
