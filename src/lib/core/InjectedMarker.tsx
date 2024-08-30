import React, {
  type Component,
  forwardRef,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { type HtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal'
import { mergeRefs } from 'react-merge-refs'
import {
  Marker as ReactLeafletMarker,
  type MarkerProps as ReactLeafletMarkerProps,
} from 'react-leaflet'
import {
  DomEvent,
  type LeafletEventHandlerFnMap,
  type Marker as LeafletMarker,
} from 'leaflet'

import { MarkerContext } from './markerContext.js'
import { useLeafletMarkerLifecycleEvents } from './useLeafletMarkerLifecycleEvents.js'
import { type RootDivIconBag } from './useBaseDivIcon.js'

interface InjectedMarkerProps extends Omit<ReactLeafletMarkerProps, 'icon'> {
  renderIcon: ReactElement
  rootDivIcon: RootDivIconBag
  disableClickPropagation?: boolean
  disableScrollPropagation?: boolean
  eventHandlers?: LeafletEventHandlerFnMap
  portalNode: HtmlPortalNode<Component<unknown>>
}

export const InjectedMarker = forwardRef<LeafletMarker, InjectedMarkerProps>(
  (
    {
      renderIcon,
      rootDivIcon: { divIcon, id },
      eventHandlers: providedEventHandlers,
      disableClickPropagation,
      disableScrollPropagation,
      portalNode,
      ...baseMarkerProps
    },
    ref,
  ) => {
    const [markerRendered, setMarkerRendered] = useState(false)

    let portalTarget: null | HTMLElement = null
    if (markerRendered) {
      portalTarget = document.getElementById(id)
    }

    const eventHandlers = useLeafletMarkerLifecycleEvents(
      providedEventHandlers,
      {
        onAdd: useCallback(() => setMarkerRendered(true), []),
        onRemove: useCallback(() => setMarkerRendered(false), []),
      },
    )

    useEffect(() => {
      if (!portalTarget) return

      if (disableClickPropagation) {
        DomEvent.disableClickPropagation(portalTarget)
      }

      if (disableScrollPropagation) {
        DomEvent.disableScrollPropagation(portalTarget)
      }
    }, [portalTarget, disableClickPropagation, disableScrollPropagation])

    const markerRef = useRef<LeafletMarker | null>(null)
    return (
      <>
        <ReactLeafletMarker
          {...baseMarkerProps}
          eventHandlers={eventHandlers}
          icon={divIcon}
          ref={mergeRefs([ref, markerRef])}
        />

        {markerRendered && portalTarget !== null && (
          <MarkerContext.Provider value={{ leafletMarker: markerRef }}>
            {/*
             * Reverse portal technique is required to fix edge cases around avoiding
             * a teardown of the icon if the `rootDivOpts` in manual layout mode change
             * such that Leaflet has to recreate its parent containers to affect the change.
             */}
            <InPortal node={portalNode}>{renderIcon}</InPortal>
            {createPortal(<OutPortal node={portalNode} />, portalTarget)}
          </MarkerContext.Provider>
        )}
      </>
    )
  },
)

InjectedMarker.displayName = 'InjectedMarker'
