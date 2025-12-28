# M2MapForge Bedienung

Hinweis: Diese Anleitung wird laufend ergänzt und bei neuen Funktionen angepasst.

## Start
- `npm install` (einmalig)
- `npm run dev`
- Projekt laden: links im Panel **Projekt Import** `Setting.txt` und `height.raw` auswählen.
- Optional: **Map-Ordner** wählen, um alle `height.raw` (pro Chunk) zu laden.

## Viewport Navigation
- Linke Maustaste: drehen
- Rechte Maustaste: schwenken
- Scroll: zoomen

## Terrain Editor
1) Oben `Terrain` wählen  
2) Modus auswählen: `Raise`, `Lower`, `Smooth`  
3) Mit der Maus im Viewport zeichnen  

Einstellungen:
- **Brush**: Größe in der Toolbar ändern
- **Strength**: Wirkstärke (Brush Strength)
- **Intensity**: Terrain‑Stärke pro Brush‑Schritt
- **Height**: globale Höhen‑Überhöhung (nur Darstellung)

Hotkeys (Terrain):
- `[` kleinerer Brush
- `]` größerer Brush
- `Strg+Z` Rückgängig
- `Strg+Y` Wiederholen

## Wasser
- Toggle `Water` aktivieren
- `Level` anpassen (Höhe der Wasser‑Plane)

## Layer
- Links unter **Layers** einzelne Ebenen ein/ausblenden (Terrain, Objects, Spawns, Attrs)

## Objekte platzieren
1) Tool `Objects` waehlen  
2) Asset im **Objekt-Browser** auswaehlen  
3) Im Viewport klicken, um ein Objekt zu platzieren  
4) Objekt anklicken und oben das Gizmo waehlen (`Bewegen`, `Drehen`, `Skalieren`)  

Hinweis:
- Skalierung wird aktuell nicht in `AreaData.txt` gespeichert.

## Attribute‑Painting
1) Tool `Attrs` wählen  
2) In der Toolbar `Mode` (`Paint`/`Erase`) und `Flag` wählen  
3) Links im Panel **Layers** die Ebene `Attrs` aktivieren  
4) Im Viewport zeichnen  

Hinweis: Aktuell wird in `attr.atr` im aktiven Chunk `00` gemalt.

Attr‑Legende:
- Farben und Transparenz lassen sich im **Layers**‑Panel anpassen.

Multi‑Chunk:
- Wenn in `Setting.txt` eine Map‑Größe > 1 eingestellt ist, wird über alle Chunks gemalt.

Attr‑Export:
- Im **Layers**‑Panel unter „Attr Export“ den Chunk‑Key angeben (z. B. `000000`).
- Alternativ `x,y` eingeben (z. B. `1,4`).
- Auf „attr.atr export“ klicken, um die Datei herunterzuladen.
- „Alle attr.atr als ZIP“ exportiert alle vorhandenen Attribute‑Dateien.
- „Alle height.raw als ZIP“ exportiert alle vorhandenen Heightmaps.
- „Gesamte Map als ZIP“ exportiert Setting.txt sowie alle vorhandenen height.raw/attr.atr.

## Troubleshooting
- Wenn die Map flach wirkt: `Height` rechts hochziehen
- Wenn nichts sichtbar ist: `height.raw` erneut laden, Größe prüfen
