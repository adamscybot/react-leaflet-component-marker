import React, {
  useCallback,
  useState,
  type MouseEventHandler,
  type PropsWithChildren,
  type HTMLAttributes,
} from 'react'
import { Marker } from '../../src/Marker'
import { MapContainer, type MarkerProps, Popup, TileLayer } from 'react-leaflet'
import { useLeafletContext } from '@react-leaflet/core'
import { divIcon, type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const BUTTON_TEXT = 'react-leaflet-component-marker button'
const ORIGINAL_MARKER_TEXT = 'I am an original marker'
const CLICK_COUNT_TEST_ID = 'click-count'

interface MarkerIconExampleProps extends HTMLAttributes<HTMLDivElement> {
  onButtonClick?: MouseEventHandler
}

const MarkerIconExample = ({
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
          icon={<MarkerIconExample onButtonClick={handleButtonClick} />}
          eventHandlers={eventHandlers}
        />
      )}
    </LeafletWrapper>
  )
}

describe('<Marker />', () => {
  it('Mounts & unmounts interactive component as Leaflet marker', () => {
    const onButtonClickSpy = cy.spy().as('onButtonClickSpy')
    cy.mount(<MarkerTest onButtonClick={onButtonClickSpy} />)

    cy.get("[data-context-available='true']").should('exist')
    cy.contains(BUTTON_TEXT).should('exist').click()
    cy.get('@onButtonClickSpy').should('have.been.calledOnce')
    cy.contains(BUTTON_TEXT).should('not.exist')
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

  it('Allows mounting component reference', () => {
    cy.mount(
      <LeafletWrapper>
        <Marker position={CENTER} icon={MarkerIconExample} />
      </LeafletWrapper>,
    )
    cy.get("[data-context-available='true']").should('exist')
    cy.contains(BUTTON_TEXT).should('exist').click()
  })

  it('Maintains component instance when `rootDivOpts` changes', () => {
    const DynamicDivOptsExample = () => {
      const [iconSize, setIconSize] = useState<[number, number]>([200, 200])
      return (
        <Marker
          position={CENTER}
          icon={
            <MarkerIconExample
              onButtonClick={() => setIconSize(([w, h]) => [w + 100, h + 100])}
              style={{ width: '100%', height: '100%' }}
            />
          }
          componentIconOpts={{
            rootDivOpts: { iconSize },
            layoutMode: 'fit-parent',
          }}
        />
      )
    }

    cy.mount(
      <LeafletWrapper>
        <DynamicDivOptsExample />
      </LeafletWrapper>,
    )
    cy.get(`[data-testid='${CLICK_COUNT_TEST_ID}']`).should('contain.text', '0')
    cy.contains(BUTTON_TEXT).click()
    cy.get(`[data-testid='${CLICK_COUNT_TEST_ID}']`).should('contain.text', '1')
  })
})
