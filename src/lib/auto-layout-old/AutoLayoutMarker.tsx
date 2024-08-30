import React, { type Component, forwardRef, useRef } from 'react'
import { type Marker as LeafletMarker } from 'leaflet'
import { type HtmlPortalNode } from 'react-reverse-portal'

import {
  type AutoLayoutOpt,
  type CoreComponentMarkerOpts,
  type BaseMarkerProps,
} from '../types.js'
import { InjectedMarker } from '../core/InjectedMarker.js'
import { useAutoLayout } from './useAutoLayout.js'
import { mergeRefs } from 'react-merge-refs'

export const AutoLayoutMarker = forwardRef<
  LeafletMarker,
  BaseMarkerProps<
    never,
    Omit<CoreComponentMarkerOpts & AutoLayoutOpt, 'layoutMode'>
  > & {
    portalNode: HtmlPortalNode<Component<unknown>>
  }
>(
  (
    {
      eventHandlers,
      icon: renderedIcon,
      position,
      componentIconOpts: {
        autoLayoutOpts,
        disableClickPropagation,
        disableScrollPropagation,
        className,
        attribution,
        pane,
      } = {},
      portalNode,
      ...otherProps
    },
    ref,
  ) => {
    const markerRef = useRef<LeafletMarker | null>(null)

    const rootDivIcon = useAutoLayout({
      autoLayoutOpts,
      markerRef,
      portalNode,
      position,
      attribution,
      className,
      pane,
    })

    return (
      <InjectedMarker
        ref={mergeRefs([markerRef, ref])}
        renderIcon={renderedIcon}
        rootDivIcon={rootDivIcon}
        eventHandlers={eventHandlers}
        position={position}
        disableClickPropagation={disableClickPropagation}
        disableScrollPropagation={disableScrollPropagation}
        portalNode={portalNode}
        {...otherProps}
      />
    )
  },
)

AutoLayoutMarker.displayName = 'AutoLayoutMarker'
