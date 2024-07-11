<p align="center">
  <h1 align="center">react-leaflet-component-marker</h1>
</p>
<p align="center">
👉 <a href="https://stackblitz.com/edit/react-leaflet-component-marker"><strong>DEMO</strong></a>
</p>
<p align="center">
📍 Use a React component as <a href="https://react-leaflet.js.org/">React Leaflet</a> markers.<br/>
🔄 Familiar swap-in API that feels like React Leaflet.<br/>
✨ Can use state, context etc. It's a full component. No BS.<br/>
💪 It's strongly typed.
</p>

# What is it

A tiny wrapper for [react-leaflet](https://react-leaflet.js.org/)'s `<Marker />` component that allows you to use a React component as a marker, with **working state, handlers, and access to parent contexts**.

The approach this library uses differs from other approaches that use `renderToString` in that it instead uses React's [Portal](https://react.dev/reference/react-dom/createPortal) functionality to achieve the effect. That means the component is not static, but a full first-class component that can have its own state, event handlers & lifecycle.

I struggled to find something that worked in a way where I could simply drop something in from a design system, and have all the context available such that it works, as well as all the interactions working as they should.

Many existing packages exist but they use techniques that mean they are very limited.

# Installation

Install using your projects package manager.

**NPM**

```bash
npm install --save @adamscybot/react-leaflet-component-marker
```

**Yarn**

```bash
yarn install --save @adamscybot/react-leaflet-component-marker
```

**PNPM**

```bash
pnpm add @adamscybot/react-leaflet-component-marker
```

# Docs

## Simple Usage

Instead of importing `Marker` from `react-leaflet`, import `Marker` from `@adamscybot/react-leaflet-component-marker`.

The `icon` prop is extended to allow for a JSX element of your choosing. All other props are identical to the `react-leaflet` [Marker](https://react-leaflet.js.org/docs/api-components/#marker) API, but there is an additional prop called `componentIconOpts` for [Advanced Usage](#advanced-usage).

The `icon` prop can also accept all of the original types of icons that the underlying `react-leaflet` Marker accepts. Though there is no gain in using this library for this case, it may help if you want to just use this library in place of Marker universally.

### Example

```javascript
import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Marker } from '@adamscybot/react-leaflet-component-marker'
import 'leaflet/dist/leaflet.css'

const MarkerIconExample = () => {
  return (
    <>
      <button onClick={() => console.log('button 1 clicked')}>Button 1</button>
      <button onClick={() => console.log('button 2 clicked')}>Button 2</button>
    </>
  )
}

const CENTER = [51.505, -0.091]
const ZOOM = 13
const App = () => {
  return (
    <MapContainer center={CENTER} zoom={ZOOM}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      <Marker position={CENTER} icon={<MarkerIconExample />} />
    </MapContainer>
  )
}
```

## Advanced Usage

The `componentIconOpts` prop can be passed, which is an object with additional options for more advanced use cases. Note, in the case where you are not passing a component to `icon`, these settings will be ignored.

Below is a list of properties this object can be provided.

#### `layoutMode`

The `layoutMode` controls how the bounding box of the React component marker behaves. It accepts two options:

- `fit-content` _(default)_. In this mode, the React component itself defines the dimensions of the marker. The component can shrink and expand at will. Logic internally to this library centers the component on its coordinates to match Leaflets default positioning; however, Leaflet itself is effectively no longer in control of this.
- `fit-parent`. In this mode, the dimensions of the React component marker are bound by the `iconSize` passed to `componentIconOpts.rootDivOpts`. Leaflet is therefore in control of the dimensions and positioning. Component markers should use elements with 100% width & height to fill the available size if needed.

#### `rootDivOpts`

> [!NOTE]
> Some options are not supported since they do not apply or make sense in the case of a React component marker. The unsupported options are `html`, `bgPos`, `shadowUrl`, `shadowSize`, `shadowAnchor`, `shadowRetinaUrl`, `iconUrl` and `iconRetinaUrl`.

An object containing properties from the supported subset of the underlying Leaflet [`divIcon`](https://leafletjs.com/reference.html#divicon) options, which this library uses as a containing wrapper.

If using `fit-parent`, you must set `iconSize` here.

#### `disableScrollPropagation`

`false` by default.

If set to `true`, panning/scrolling the map will not be possible "through" the component marker.

#### `disableClickPropagation`

`false` by default.

If set to `true`, clicking on the component marker will not be captured by the underlying map.

#### `unusedOptsWarning`

`true` by default.

Can be set to `false` in order to not warn in console about cases where `componentIconOpts` was set but `icon` was not a React component.

#### `unusedOptsWarning`

`true` by default.

Can be set to `false` in order to not warn in console about cases where the `layoutMode` was `fit-parent` but their was no `iconSize` defined in the `rootDivOpts`.
