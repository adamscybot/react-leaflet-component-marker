import React, { useMemo, isValidElement, forwardRef, useEffect } from 'react'
import { isValidElementType } from 'react-is'
import {
  Marker as ReactLeafletMarker,
  type MarkerProps as ReactLeafletMarkerProps,
} from 'react-leaflet'
import { type Marker as LeafletMarker } from 'leaflet'
import { createHtmlPortalNode } from 'react-reverse-portal'

import { logCodedString } from './lib/logging.js'
import { type MarkerProps, type BaseMarkerProps } from './lib/types.js'
import { AutoLayoutMarker } from './lib/auto-layout/AutoLayoutMarker.js'

// const iconDeps = [
//   id,
//   layoutMode,
//   attribution,
//   className,
//   pane,
//   Boolean(disableClickPropagation),
//   Boolean(disableScrollPropagation),
//   dynamicPopupAnchor,
//   dynamicTooltipAnchor,
//   ...useCoordsFromPointExpression(iconSize),
//   ...useCoordsFromPointExpression(iconAnchor),
//   ...useCoordsFromPointExpression(popupAnchor),
//   ...useCoordsFromPointExpression(tooltipAnchor),
// ]

const ComponentMarker = forwardRef<LeafletMarker, BaseMarkerProps>(
  (props, ref) => {
    if (
      props.componentIconOpts?.layoutMode === 'auto' ||
      props.componentIconOpts?.layoutMode === undefined
    ) {
      return (
        <AutoLayoutMarker
          ref={ref}
          layoutOpts={props.componentIconOpts?.autoLayoutOpts}
          {...props}
        />
      )
    }

    return null
  },
)

ComponentMarker.displayName = 'ComponentMarker'

/**
 * A modified version of the [react-leaflet
 * Marker](https://react-leaflet.js.org/docs/api-components/#marker) component
 * that is extended such that it allows a {@link ReactElement} to be used as the
 * icon.
 *
 * @example
 *
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
 *
 */
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

Marker.displayName = 'Marker'
