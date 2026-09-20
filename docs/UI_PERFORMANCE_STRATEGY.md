# FULFILL-X — UI PERFORMANCE STRATEGY

**Document Version:** `1.0.0`  
**Phase:** `Phase 12 — Dynamic Spatial UI Transformation`  
**Status:** `APPROVED ARCHITECTURE BLUEPRINT`

---

## 1. PERFORMANCE BUDGET & FPS TARGETS

- **Desktop Target:** Steady `60 FPS` on standard integrated GPU or dedicated graphics.
- **Mobile Target:** `30+ FPS` fallback mode on mobile hardware.
- **Initial Page Load:** `<1.5s` Time to Interactive (TTI).
- **Route Transition Latency:** `<100ms` UI response latency.

---

## 2. 3D WEBGL OPTIMIZATION STRATEGIES

### 1. Polygon & Geometry Budget
- Maximum scene complexity bounded to `<50,000 triangles` per viewport.
- Node geometries use low-poly instanced spheres and cylinders.

### 2. Instanced Mesh Rendering (`InstancedMesh`)
- Repeated 3D network nodes, edges, risk pulse rings, and particle streams are rendered using Three.js `InstancedMesh` in a single GPU draw call rather than individual meshes, keeping draw calls `<30 per frame`.

### 3. Dynamic Level-of-Detail (LOD)
- Bounded LOD system reduces node mesh geometry detail when the camera zooms out, swapping 3D meshes for lightweight 2D billboard sprites when node distance exceeds 100 spatial units.

### 4. Memory & Garbage Collection
- Textures capped at `1024x1024` resolution.
- Unused 3D geometries, materials, and textures are explicitly disposed on component unmount (`geometry.dispose()`, `material.dispose()`) to eliminate WebGL memory leaks.

### 5. WebGL Context Loss Recovery
- Event listeners for `webglcontextlost` and `webglcontextrestored` automatically pause the rendering loop during context loss and restore shaders cleanly upon recovery without crashing the page.

### 6. Background Tab Throttling
- When the browser tab loses focus (`document.hidden === true`), the 3D rendering loop is paused (`requestAnimationFrame` halted) to eliminate idle CPU/GPU consumption.
