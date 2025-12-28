# Uebergabe M2MapForge

## Stand der Implementierung
- Vite + React + TypeScript Projekt steht, Tailwind 4 eingerichtet.
- 3D Viewport mit R3F, OrbitControls, Auto-Camera.
- Heightmap Rendering mit Height-Gradient (sichtbares Terrain) + HeightScale berücksichtigt.
- Wasser-Plane mit Level-Slider.
- Terrain-Brush (Raise/Lower/Smooth) + Brush-Preview.
- Attribute-Overlay + Attribute-Painting (Paint/Erase + Flag).
- Multi-Chunk Rendering/Editing (Chunk-Keys wie 000000/000001).
- ZIP-Import fuer Map-Ordner (height.raw, attr.atr) inkl. Setting.txt Erkennung.
- AreaData Import/Export (einzeln + ZIP) und Objekte platzieren im Viewport.
- Property-Import (Ordner) fuer Objekt-Assets (CRC32 + GR2/Treefile).
- Export: attr.atr (einzeln), alle attr.atr als ZIP, alle height.raw als ZIP, gesamte Map als ZIP.
- Bedienungsanleitung: `docs/usage.md`

## Wichtige Nutzung
- Start: `npm install`, `npm run dev`
- Projekt-Import:
  - `Setting.txt` laden (MapSize/CellScale wird gesetzt)
  - `Map-ZIP` laden (Ordnerstruktur wie 000000/height.raw, 000001/height.raw, ...)
- AreaData: in Project-Import `AreaData.txt` laden (Chunk-ID angeben).
- Objekte: Objekt-Browser -> Property-Ordner importieren, Tool `Objects` waehlen und im Viewport klicken.
- Terrain-Tool: Tool `Terrain` waehlen, im Viewport zeichnen.
- Attrs-Tool: Tool `Attrs` waehlen, Layer `Attrs` aktivieren, malen.
- Export: im Layers-Panel.

## Dateipfade (zentral)
- UI/Layout: `src/components/layout/AppShell.tsx`
- Toolbar: `src/components/toolbar/ToolOptions.tsx`
- Import/ZIP: `src/components/panels/ProjectLoader.tsx`
- Objekt-Browser: `src/components/panels/ObjectBrowser.tsx`
- Terrain/Multi-Chunk: `src/components/viewport/TerrainMesh.tsx`
- Objekt-Rendering: `src/components/viewport/ObjectRenderer.tsx`
- Attr-Overlay: `src/components/viewport/AttrOverlay.tsx`
- Wasser: `src/components/viewport/WaterPlane.tsx`
- Stores: `src/store/editor-store.ts`, `src/store/project-store.ts`
- Parser: `src/lib/parsers/*`
- Property-Parser: `src/lib/parsers/property.ts`
- Map-Math: `src/lib/utils/map-math.ts`
- CRC32 Utils: `src/lib/utils/crc32.ts`
- Anleitung: `docs/usage.md`

## Bekannte Einschraenkungen
- Multi-Chunk Heightmap-Import geht aktuell ueber ZIP (Ordner-Import in Firefox/Edge war nicht stabil).
- Multi-Chunk Heightmaps: Nur per ZIP fuer alle Chunks.
- Attribute-Export: funktioniert, aber kein server_attr Export.
- Kein Texturing (tile.raw) implementiert.
- Nach Property-Ordner-Import reagiert Zoom im Viewport nicht mehr (UI-Block/zu viele Assets).

## Naechste sinnvolle Schritte
1) Fix: Property-Import lazy/batch oder nur CRCs aus AreaData laden (Zoom-Problem).
2) Object Placement: Auswahl/Move/Rotate (Gizmos) + Delete.
3) Tile-Texturing (tile.raw) + TextureSet Parser.
4) Chunk-Navigator / Mini-Grid fuer schnellen Sprung.
5) server_attr Generierung.
6) Spawn Editor visuell + Validierung.

## Testdaten
- Map-Beispiel: `metin2_map_a1` (Ordnerstruktur 000000/000001/... mit height.raw).
- ZIP-Struktur muss Chunk-Ordner enthalten (000000/height.raw usw.).
