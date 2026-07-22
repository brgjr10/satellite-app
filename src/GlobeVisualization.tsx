import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

const SATELLITE_TILES = 
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

export interface Camera {
  id: string
  name: string
  latitude: number
  longitude: number
  type: 'traffic' | 'cctv' | 'flock' | 'police'
  imageUrl?: string
  videoUrl?: string
  direction?: string
  highway?: string
}

export interface CrimeIncident {
  id: string
  latitude: number
  longitude: number
  category: string
  date: string
  description: string
}

export interface PoliceUnit {
  id: string
  latitude: number
  longitude: number
  type: string
  status: string
}

export interface Aircraft {
  icao24: string
  callsign: string
  origin_country: string
  longitude: number
  latitude: number
  altitude: number
  velocity: number
  on_ground: boolean
  time: number
}

export interface Satellite {
  sat_id: number
  sat_name: string
  int_des: string
  launch_date: string
  longitude: number
  latitude: number
  altitude: number
}

export interface GlobeNode {
  id: string
  type: string
  label: string
  lat: number
  lng: number
  color: string
  imageUrl?: string
  altitude?: number
}

const STAR_TEX_SIZE = 2048

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeStarCanvas(size: number, seed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000007'
  ctx.fillRect(0, 0, size, size)

  const rand = mulberry32(seed)
  const count = Math.floor((size * size) / 1100)
  for (let i = 0; i < count; i++) {
    const x = rand() * size
    const y = rand() * size
    const r = Math.pow(rand(), 3) * 1.7 + 0.35
    const b = 0.45 + rand() * 0.55
    const tone = rand()
    let cr: number, cg: number, cb: number
    if (tone < 0.7) {
      cr = cg = cb = 255
    } else if (tone < 0.85) {
      cr = 200; cg = 218; cb = 255
    } else {
      cr = 255; cg = 224; cb = 196
    }
    ctx.beginPath()
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${b})`
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    if (r > 1.1 && b > 0.8) {
      ctx.beginPath()
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${b * 0.18})`
      ctx.arc(x, y, r * 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return canvas
}

function makeStarSkyBox(): Cesium.SkyBox {
  return new Cesium.SkyBox({
    sources: {
      positiveX: makeStarCanvas(STAR_TEX_SIZE, 11),
      negativeX: makeStarCanvas(STAR_TEX_SIZE, 23),
      positiveY: makeStarCanvas(STAR_TEX_SIZE, 37),
      negativeY: makeStarCanvas(STAR_TEX_SIZE, 53),
      positiveZ: makeStarCanvas(STAR_TEX_SIZE, 71),
      negativeZ: makeStarCanvas(STAR_TEX_SIZE, 97),
    },
  })
}

function drawSatelliteIcon(ctx: CanvasRenderingContext2D, s: number) {
  ctx.clearRect(0, 0, s, s)
  ctx.strokeStyle = '#00fff9'
  ctx.fillStyle = '#00fff9'
  ctx.lineWidth = Math.max(1, s * 0.06)
  ctx.shadowColor = '#00fff9'
  ctx.shadowBlur = s * 0.18
  ctx.fillRect(s * 0.40, s * 0.40, s * 0.20, s * 0.20)
  ctx.fillRect(s * 0.16, s * 0.44, s * 0.20, s * 0.12)
  ctx.fillRect(s * 0.64, s * 0.44, s * 0.20, s * 0.12)
  ctx.beginPath()
  ctx.moveTo(s * 0.5, s * 0.40)
  ctx.lineTo(s * 0.5, s * 0.18)
  ctx.stroke()
}

function drawPlaneIcon(ctx: CanvasRenderingContext2D, s: number) {
  ctx.clearRect(0, 0, s, s)
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#00fff9'
  ctx.shadowBlur = s * 0.18
  ctx.beginPath()
  ctx.moveTo(s * 0.5, s * 0.10)
  ctx.lineTo(s * 0.62, s * 0.46)
  ctx.lineTo(s * 0.5, s * 0.60)
  ctx.lineTo(s * 0.38, s * 0.46)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(s * 0.5, s * 0.46)
  ctx.lineTo(s * 0.90, s * 0.56)
  ctx.lineTo(s * 0.5, s * 0.62)
  ctx.lineTo(s * 0.10, s * 0.56)
  ctx.closePath()
  ctx.fill()
}

function makeIcon(draw: (ctx: CanvasRenderingContext2D, s: number) => void): string {
  const size = 40
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  draw(ctx, size)
  return c.toDataURL()
}

const SAT_ICON = makeIcon(drawSatelliteIcon)
const PLANE_ICON = makeIcon(drawPlaneIcon)
const ICON_TYPES = new Set(['satellite', 'aircraft'])

const nodeColor = (type: string) =>
  type === 'traffic' ? '#cccccc' :
  type === 'cctv' ? '#ffffff' :
  type === 'flock' ? '#aaaaaa' :
  type === 'crime' ? '#ff6600' :
  type === 'police' ? '#ff0066' :
  type === 'aircraft' ? '#ffffff' :
  type === 'satellite' ? '#dddddd' : '#ffffff'

const GlobeVisualization = forwardRef<any, any>(
  ({ cameras, crimes, policeUnits, aircraft, satellites, onNodeClick, destination, onCursorChange }, _ref) => {
    const globeContainerRef = useRef<HTMLDivElement>(null)
    const viewerRef = useRef<Cesium.Viewer | null>(null)
    const neonLayerRef = useRef<Cesium.ImageryLayer | null>(null)
    const destinationEntityRef = useRef<Cesium.Entity | null>(null)
    const satBillboardCollRef = useRef<Cesium.BillboardCollection | null>(null)
    const satLabelCollRef = useRef<Cesium.LabelCollection | null>(null)
    const prevDestRef = useRef<{ lat: number; lng: number } | null>(null)
    const [_selectedNode, _setSelectedNode] = useState<GlobeNode | null>(null)

    useLayoutEffect(() => {
      const container = globeContainerRef.current
      if (!container) return

      const viewer = new Cesium.Viewer(container, {
        baseLayer: new Cesium.ImageryLayer(
          new Cesium.UrlTemplateImageryProvider({
            url: SATELLITE_TILES,
            maximumLevel: 19,
            credit: 'TERRAIN DATA',
          }),
          {}
        ),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        selectionIndicator: false,
        infoBox: false,
        shadows: false,
        requestRenderMode: false,
        creditContainer: document.createElement('div'),
      })
      viewerRef.current = viewer

      viewer.scene.skyBox = makeStarSkyBox()

      satBillboardCollRef.current = viewer.scene.primitives.add(
        new Cesium.BillboardCollection()
      )
      satLabelCollRef.current = viewer.scene.primitives.add(
        new Cesium.LabelCollection()
      )

      viewer.scene.globe.baseColor = Cesium.Color.BLACK
      viewer.scene.globe.showGroundAtmosphere = false
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.show = false
      }
      viewer.scene.fog.enabled = false
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 4.0e7
      viewer.scene.globe.depthTestAgainstTerrain = true
      const maxZoom = viewer.scene.screenSpaceCameraController.maximumZoomDistance
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(0, 0, maxZoom),
        orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
        duration: 0,
      })

      const tick = () => {
        const h = viewer.camera.positionCartographic?.height ?? 2e7
        const t = Math.max(0, Math.min(1,
          (Math.log(h) - Math.log(1e3)) / (Math.log(3e7) - Math.log(1e3))))
        if (neonLayerRef.current) neonLayerRef.current.alpha = 1 - t
      }
      ;(viewerRef.current as any).clock.onTick.addEventListener(tick)

      let lastClientMouse: { x: number; y: number } | null = null
      let rafId = 0

      const pushCoordinates = (viewerInstance: Cesium.Viewer, x: number, y: number) => {
        if (!onCursorChange) return
        const rect = viewerInstance.container.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return
        const canvasX = Math.max(0, Math.min(rect.width, x - rect.left))
        const canvasY = Math.max(0, Math.min(rect.height, y - rect.top))
        const cartesian = viewerInstance.camera.pickEllipsoid(
          new Cesium.Cartesian2(canvasX, canvasY),
          viewerInstance.scene.globe.ellipsoid
        )
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          if (cartographic) {
            const lat = Cesium.Math.toDegrees(cartographic.latitude)
            const lng = Cesium.Math.toDegrees(cartographic.longitude)
            onCursorChange(lat, lng)
          }
        }
      }

      const scheduleUpdate = () => {
        if (rafId) return
        rafId = requestAnimationFrame(() => {
          rafId = 0
          if (lastClientMouse && viewerRef.current) {
            pushCoordinates(viewerRef.current, lastClientMouse.x, lastClientMouse.y)
          }
        })
      }

      const onNativeMouseMove = (e: Event) => {
        const me = e as MouseEvent
        lastClientMouse = { x: me.clientX, y: me.clientY }
        scheduleUpdate()
      }

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.container as any)
      handler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position)
        const node = (picked?.id as any)?._node ?? null
        _setSelectedNode(node)
        onNodeClick?.(node)
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

      viewer.container.addEventListener('mousemove', onNativeMouseMove as EventListener)
      viewer.container.addEventListener('mouseleave', () => {
        lastClientMouse = null
      })
      viewer.scene.preRender.addEventListener(() => {
        if (lastClientMouse && viewerRef.current && !rafId) {
          pushCoordinates(viewerRef.current, lastClientMouse.x, lastClientMouse.y)
        }
      })

      return () => {
        viewer.scene.preRender.removeEventListener(() => {})
        viewer.container.removeEventListener('mousemove', onNativeMouseMove as EventListener)
        handler.destroy()
        viewer.destroy()
        viewerRef.current = null
        destinationEntityRef.current = null
      }
    }, [onNodeClick, onCursorChange])

    useEffect(() => {
      const viewer = viewerRef.current
      if (!viewer) return

      viewer.entities.removeAll()
      const nodes: any[] = []

      const addPoint = (n: any) => {
        const color = Cesium.Color.fromCssColorString(nodeColor(n.type))
        const useIcon = ICON_TYPES.has(n.type)
        const entityOpts: any = {
          position: Cesium.Cartesian3.fromDegrees(n.lng, n.lat),
          label: {
            text: n.label,
            font: '10px "JetBrains Mono", monospace',
            fillColor: color,
            style: Cesium.LabelStyle.FILL,
            pixelOffset: new Cesium.Cartesian2(0, -14),
            showBackground: false,
            disableDepthTestDistance: 0,
          },
        }
        if (useIcon) {
          entityOpts.billboard = {
            image: n.type === 'satellite' ? SAT_ICON : PLANE_ICON,
            width: 22,
            height: 22,
            disableDepthTestDistance: 0,
          }
        } else {
          entityOpts.point = {
            pixelSize: 6,
            color,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: 0,
          }
        }
        const entity = viewer.entities.add(entityOpts)
        ;(entity as any)._node = n
        nodes.push(n)
      }

      cameras.forEach((c: Camera) => addPoint({
        id: c.id, lat: c.latitude, lng: c.longitude, label: c.name,
        type: c.type, imageUrl: c.imageUrl,
      }))
      crimes.forEach((c: CrimeIncident) => addPoint({
        id: c.id, lat: c.latitude, lng: c.longitude, label: c.category, type: 'crime',
      }))
      policeUnits.forEach((p: PoliceUnit) => addPoint({
        id: p.id, lat: p.latitude, lng: p.longitude, label: p.type, type: 'police',
      }))
      aircraft.forEach((a: Aircraft) => addPoint({
        id: a.icao24, lat: a.latitude, lng: a.longitude, label: a.callsign, type: 'aircraft', altitude: a.altitude,
      }))
      const manySats = satellites.length > 1000
      const satColl = satBillboardCollRef.current
      const satLabelColl = satLabelCollRef.current
      if (satColl) satColl.removeAll()
      if (satLabelColl) satLabelColl.removeAll()

      if (manySats) {
        if (satColl) {
          for (const s of satellites) {
            if (s.latitude == null || s.longitude == null) continue
            const pos = Cesium.Cartesian3.fromDegrees(s.longitude, s.latitude, 100000)
            satColl.add({
              position: pos,
              image: SAT_ICON,
              width: 18,
              height: 18,
            })
            if (satLabelColl) {
              satLabelColl.add({
                position: pos,
                text: s.sat_name,
                font: '10px "JetBrains Mono", monospace',
                fillColor: Cesium.Color.WHITE,
                pixelOffset: new Cesium.Cartesian2(0, -8),
                style: Cesium.LabelStyle.FILL,
                scaleByDistance: new Cesium.NearFarScalar(2.0e6, 1.0, 4.0e7, 0.55),
                disableDepthTestDistance: 0,
              })
            }
          }
        }
      } else {
        satellites.forEach((s: Satellite) => addPoint({
          id: String(s.sat_id), lat: s.latitude, lng: s.longitude,
          label: `${s.sat_name} · NORAD ${s.sat_id}`,
          type: 'satellite', altitude: s.altitude,
        }))

        satellites.forEach((s: Satellite) => {
          const altMeters = (s.altitude || 400) * 1000
          const start = Cesium.Cartesian3.fromDegrees(s.longitude, s.latitude, altMeters)
          const end = Cesium.Cartesian3.fromDegrees(
            s.longitude + 179.5,
            -s.latitude + 0.5,
            altMeters
          )
          viewer.entities.add({
            polyline: {
              positions: [start, end],
              width: 1,
              material: new Cesium.PolylineDashMaterialProperty({ color: Cesium.Color.fromCssColorString('#ff00ff'), dashLength: 20 }),
              arcType: Cesium.ArcType.NONE,
            },
          })
        })
      }
    }, [cameras, crimes, policeUnits, aircraft, satellites])

    useEffect(() => {
      const viewer = viewerRef.current
      if (!viewer || !destination || isNaN(destination.lat) || isNaN(destination.lng)) return

      if (!destinationEntityRef.current) {
        destinationEntityRef.current = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(destination.lng, destination.lat),
          point: {
            pixelSize: 12,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.MAX_SAFE_INTEGER,
          },
          label: {
            text: `${destination.name}\n${destination.lat.toFixed(4)}°, ${destination.lng.toFixed(4)}°`,
            font: '10px "JetBrains Mono", monospace',
            fillColor: Cesium.Color.YELLOW,
            style: Cesium.LabelStyle.FILL,
            pixelOffset: new Cesium.Cartesian2(0, -16),
            showBackground: true,
            backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
            backgroundPadding: new Cesium.Cartesian2(4, 2),
          },
        })
      }

      const entity = destinationEntityRef.current
      entity.position = new Cesium.ConstantPositionProperty(Cesium.Cartesian3.fromDegrees(destination.lng, destination.lat))
      if (entity.label) {
        entity.label.text = `${destination.name}\n${destination.lat.toFixed(4)}°, ${destination.lng.toFixed(4)}°` as any
      }
      entity.show = true

      const moved =
        prevDestRef.current !== null &&
        (prevDestRef.current.lat !== destination.lat ||
          prevDestRef.current.lng !== destination.lng)
      if (moved) {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(destination.lng, destination.lat, 80000),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: 0,
          },
          duration: 1.5,
        })
      }
      prevDestRef.current = { lat: destination.lat, lng: destination.lng }
    }, [destination])

    return (
      <div className="relative w-full h-full min-h-0">
        <div ref={globeContainerRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="scanline-overlay" />
          <div className="hud-overlay" />
        </div>

        <div className="relative z-10 h-full pointer-events-none">
          </div>
      </div>
    )
  }
)

export default GlobeVisualization