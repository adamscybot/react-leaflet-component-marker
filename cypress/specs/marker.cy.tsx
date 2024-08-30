import React, {
  useCallback,
  useState,
  type MouseEventHandler,
  type PropsWithChildren,
  type HTMLAttributes,
} from 'react'
import {
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  Marker as OriginalMarker,
  type TooltipProps,
} from 'react-leaflet'
import { FaMapPin } from 'react-icons/fa'
import { useLeafletContext } from '@react-leaflet/core'
import { divIcon, type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Marker } from '../../src/Marker'
import { type MarkerProps } from '../../src/lib/types'

const BUTTON_TEXT = 'react-leaflet-component-marker button'
const ORIGINAL_MARKER_TEXT = 'I am an original marker'
const CLICK_COUNT_TEST_ID = 'click-count'

interface MarkerIconExampleProps extends HTMLAttributes<HTMLDivElement> {
  onButtonClick?: MouseEventHandler
}

const MarkerIconInteractiveExample = ({
  onButtonClick,
  ...divAttrs
}: MarkerIconExampleProps) => {
  const [clickCount, setClickCount] = useState(0)
  const context = useLeafletContext()

  const handleButtonClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      setClickCount((prev) => prev + 1)
      onButtonClick?.(e)
    },
    [onButtonClick],
  )

  const { style, ...otherDivAttrs } = divAttrs ?? {}

  return (
    <div
      data-context-available={context?.map ? 'true' : 'false'}
      style={{ padding: 10, background: 'lightblue', ...style }}
      {...otherDivAttrs}
    >
      <button onClick={handleButtonClick}>{BUTTON_TEXT}</button>
      <div>
        Click count:
        <span data-testid={CLICK_COUNT_TEST_ID}>{clickCount}</span>
      </div>
    </div>
  )
}

const MarkerIconSimple = () => {
  return <FaMapPin style={{ width: 150, height: 240, color: 'red' }} />
}

const CENTER: LatLngExpression = [51.505, -0.091]
const ZOOM = 13
const LeafletWrapper = ({ children }: PropsWithChildren<object>) => (
  <MapContainer
    center={CENTER}
    zoom={ZOOM}
    style={{ width: '100vw', height: '100vh' }}
  >
    <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
    />
    {children}
  </MapContainer>
)

interface MarkerTestProps
  extends MarkerIconExampleProps,
    Pick<MarkerProps, 'eventHandlers'> {}

const MarkerTest = ({ onButtonClick, eventHandlers }: MarkerTestProps) => {
  const [renderMarker, setRenderMarker] = useState(true)

  const handleButtonClick: MouseEventHandler = (e) => {
    setRenderMarker(false)
    onButtonClick(e)
  }

  return (
    <LeafletWrapper>
      {renderMarker && (
        <Marker
          position={CENTER}
          icon={
            <MarkerIconInteractiveExample onButtonClick={handleButtonClick} />
          }
          eventHandlers={eventHandlers}
        >
          <div>
            <Popup>Test</Popup>
            <Tooltip>Test</Tooltip>
          </div>
        </Marker>
      )}
    </LeafletWrapper>
  )
}

describe('<Marker />', () => {
  describe('Baseline swap-in behaviors', () => {
    it('Allows other non-component icon types', () => {
      cy.mount(
        <LeafletWrapper>
          <Marker
            position={CENTER}
            icon={divIcon({ html: `<div>${ORIGINAL_MARKER_TEXT}</div>` })}
          />
        </LeafletWrapper>,
      )

      cy.contains(ORIGINAL_MARKER_TEXT).should('exist')
    })

    it('Calls user-supplied add event handler', () => {
      const onAddSpy = cy.spy().as('onAddSpy')
      cy.mount(
        <MarkerTest
          eventHandlers={{
            add() {
              onAddSpy()
            },
          }}
        />,
      )

      cy.get('@onAddSpy').should('have.been.calledOnce')
    })
  })

  describe('Component icon support', () => {
    describe('Basic', () => {
      it('Mounts & unmounts interactive component as Leaflet marker', () => {
        const onButtonClickSpy = cy.spy().as('onButtonClickSpy')
        cy.mount(<MarkerTest onButtonClick={onButtonClickSpy} />)

        cy.get("[data-context-available='true']").should('exist')
        cy.contains(BUTTON_TEXT).should('exist').click()
        cy.get('@onButtonClickSpy').should('have.been.calledOnce')
        cy.contains(BUTTON_TEXT).should('not.exist')
      })

      it('Allows mounting component reference', () => {
        cy.mount(
          <LeafletWrapper>
            <Marker position={CENTER} icon={MarkerIconInteractiveExample} />
          </LeafletWrapper>,
        )
        cy.get("[data-context-available='true']").should('exist')
        cy.contains(BUTTON_TEXT).should('exist').click()
      })

      it('Anchors to the same point as the default marker', () => {
        cy.mount(
          <LeafletWrapper>
            <Marker position={CENTER} icon={MarkerIconSimple} />
            <OriginalMarker position={CENTER} />
          </LeafletWrapper>,
        )

        cy.get('img.leaflet-marker-icon').then((originalMarker) => {
          cy.get('[data-react-component-marker="root"]').then((newMarker) => {
            expect(newMarker.offset().top + newMarker.height()).equal(
              originalMarker.offset().top + originalMarker.height(),
              'Component marker and original marker have same position',
            )
          })
        })
      })

      it('Maintains component instance when `rootDivOpts` changes', () => {
        const DynamicDivOptsExample = () => {
          const [iconSize, setIconSize] = useState<[number, number]>([200, 200])
          return (
            <Marker
              position={CENTER}
              icon={
                <MarkerIconInteractiveExample
                  onButtonClick={() =>
                    setIconSize(([w, h]) => [w + 100, h + 100])
                  }
                  style={{ width: iconSize[0], height: iconSize[1] }}
                />
              }
              // componentIconOpts={{
              //   rootDivOpts: { iconSize },
              //   layoutMode: 'fit-parent',
              // }}
            ></Marker>
          )
        }

        cy.mount(
          <LeafletWrapper>
            <DynamicDivOptsExample />
          </LeafletWrapper>,
        )
        cy.get(`[data-testid='${CLICK_COUNT_TEST_ID}']`).should(
          'contain.text',
          '0',
        )
        cy.contains(BUTTON_TEXT).click()
        cy.get(`[data-testid='${CLICK_COUNT_TEST_ID}']`).should(
          'contain.text',
          '1',
        )
      })
    })
  })

  describe('Tooltip support', () => {
    const TOOLTIP_TEXT = 'I am an example tooltip'

    const TooltipMarker = ({
      tooltipProps,
      ...otherProps
    }: {
      tooltipProps?: TooltipProps
    } & Omit<MarkerProps, 'position' | 'icon'>) => {
      return (
        <LeafletWrapper>
          <Marker position={CENTER} icon={MarkerIconSimple} {...otherProps}>
            <Tooltip {...tooltipProps}>{TOOLTIP_TEXT}</Tooltip>
          </Marker>
        </LeafletWrapper>
      )
    }

    it('Renders on hover', () => {
      cy.mount(<TooltipMarker tooltipProps={{ direction: 'left' }} />)
      cy.get('[data-react-component-marker="root"]').trigger('mouseover')
      cy.contains(TOOLTIP_TEXT).should('exist')
    })

    it('Auto positions tooltip centred to the side', () => {
      cy.mount(<TooltipMarker tooltipProps={{ permanent: true }} />)

      cy.get('[data-react-component-marker="root"]').then((newMarker) => {
        cy.wait(500).then(() => {
          cy.get('.leaflet-tooltip').then((tooltip) => {
            const markerMidYDelta =
              newMarker.offset().top + newMarker.height() / 2
            const markerLeftXDelta = newMarker.offset().left
            const tooltipMidYDelta = tooltip.offset().top + tooltip.height() / 2
            const tooltipRightXDelta = tooltip.offset().left + tooltip.width()

            console.log(markerMidYDelta, tooltipMidYDelta)
            expect(tooltipMidYDelta).approximately(
              markerMidYDelta,
              7,
              'Tooltip centred on y axis with marker',
            )

            expect(tooltipRightXDelta).approximately(
              markerLeftXDelta,
              25,
              'Tooltip aligned with marker edge on x axis',
            )
          })
        })
      })
    })
  })

  describe('Popup support', () => {
    const POPUP_TEXT = 'I am an example popup'

    beforeEach(() => {
      cy.mount(
        <LeafletWrapper>
          <Marker position={CENTER} icon={MarkerIconSimple}>
            <Popup>{POPUP_TEXT}</Popup>
          </Marker>
        </LeafletWrapper>,
      )
    })

    it('Renders on click', () => {
      cy.get('[data-react-component-marker="root"]').click()
      cy.contains(POPUP_TEXT).should('exist')
    })

    it('Auto positions popup above & centred', () => {
      cy.get('[data-react-component-marker="root"]').click()

      cy.get('[data-react-component-marker="root"]').then((newMarker) => {
        cy.wait(500).then(() => {
          cy.get('.leaflet-popup').then((popup) => {
            const markerTopYDelta = newMarker.offset().top
            const markerMidXDelta =
              newMarker.offset().left + newMarker.width() / 2
            const popupBottomYDelta = popup.offset().top + popup.height()
            const popupMidXDelta = popup.offset().left + popup.width() / 2

            expect(popupBottomYDelta).approximately(
              markerTopYDelta,
              7,
              'Popup just above top of marker',
            )

            expect(popupMidXDelta).approximately(
              markerMidXDelta,
              2,
              'Popup centred on x axis with marker',
            )
          })
        })
      })
    })
  })
})
