# PALOS (App-palos)

Capa de producto y experiencia para una app de golf centrada en la vuelta: score único, social games, challenges, estadísticas honestas e historial.

## Especificación

→ **[Especificación consolidada de Producto y Experiencia](docs/ESPECIFICACION-PRODUCTO-EXPERIENCIA-PALOS.md)**

## Prototipo PWA

Carpeta: [`palos-pwa/`](palos-pwa/)

```bash
cd palos-pwa
npm install
npm run dev      # desarrollo
npm run build && npm run preview
```

MVP jugable en el móvil (añadir a pantalla de inicio como PWA):

- Setup de partida (campo, tee, jugadores, formatos, social games)
- Pantalla de hoyo con score + FIR/GIR/putts/pen
- Putting King, GIR King, Chaos Golf, Birdie Hunt, etc.
- Custom Game Builder + código de compartir
- Leaderboards multi-capa y resumen
- Historial local (offline)

Los Social Games están etiquetados como no oficiales.
