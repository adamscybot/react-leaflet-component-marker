import React, { forwardRef } from 'react'
import { type Marker as LeafletMarker } from 'leaflet'

import { type ComponentMarkerProps, type MarkerLayoutHook } from './types.js'
import { ComponentMarker } from './ComponentMarker.js'

export type MarkerLayoutComponent<Hook extends MarkerLayoutHook<any>> = {
  /**
   * The layout options for the layout type that this component represents.
   * Refer to the documentation.
   */
  layoutOpts?: Parameters<Hook>[0]
} & Omit<ComponentMarkerProps, 'layout'>

/**
 * This utility function allows for the easy creation of a React component that
 * binds a given layout hook to a Marker. The intention is for all layouts to
 * use this in order to provide a component interface if preferred by the user.
 *
 * The resulting component accepts the options of the layout hook inside of a
 * `layoutOpts` hook.
 *
 * Note this should never be called inside of a component.
 *
 * @param useLayoutHook  The layout hook to compose into a component.
 * @param displayName    The React component display name for debugging.
 * @returns A React component bound to the layout hook.
 */
export const makeLayoutComponent = <Hook extends MarkerLayoutHook<any>>(
  useLayoutHook: Hook,
  displayName: string,
) => {
  const LayoutComponent = forwardRef<
    LeafletMarker,
    MarkerLayoutComponent<Hook>
  >(({ layoutOpts, ...otherProps }, ref) => {
    const layout = useLayoutHook(layoutOpts)
    return <ComponentMarker ref={ref} {...otherProps} layout={layout} />
  })

  LayoutComponent.displayName = displayName

  return LayoutComponent
}
