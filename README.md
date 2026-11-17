# DRINK

**Scroll into a can of strawberry energy drink.** A cold can in a dark studio opens, the camera dives through the opening and the surface of the drink, rises with the bubbles, drifts past pieces of strawberry, and comes out of the dark onto strawberries strewn across the studio floor.

> DRINK is a fictional brand, made as a portfolio project. The product, its numbers and its claims are part of the story, not a real drink.

**Live:** [energy-drink-website-dzenis.vercel.app](https://energy-drink-website-dzenis.vercel.app/)

## What it shows

- **Shaders, all written by hand in GLSL:** condensation on the cold metal, the drink seen from inside, bubbles, caustics, light shafts and the moment of crossing the surface.
- **One continuous camera flight** from the can to the inside, then through the dark to the end, driven by the scroll, with no cuts in the picture.
- **Performance on phones:** small models, effects on the GPU, the scene loaded as a separate download behind a loader.
- **Everything made from scratch:** the concept, the design, the models in Blender and the patterns in shaders.

## The five stations

| #   | Station  | What happens                                                                                                                  |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cold can | The can rises out of the dark and turns slowly. Drag across it, or rub it with a finger, to wipe off the frost.               |
| 2   | Open     | The tab lifts and the panel swings in as the camera comes over the lid.                                                       |
| 3   | Fizz     | The camera has gone through the opening and the surface. It looks back up at the bright opening while bubbles rise around it. |
| 4   | Taste    | Pieces of strawberry float in the drink, lit by caustics from above.                                                          |
| 5   | End      | The picture goes black, and strawberries on the studio floor come up out of it, lit by a light that follows the pointer.      |

Wheel, swipe and the arrow or Page keys move one station at a time; the header takes you to any of them.

## How it's made

### Shaders

Each effect is its own component with its own `.glsl` files under [`src/shaders/`](src/shaders/), laid out like the components in [`src/experience/`](src/experience/). Effects on the can's metal are injected into three.js's standard material through `onBeforeCompile`, so they keep its lighting; everything inside the drink uses its own shaders.

| Effect        | How                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Condensation  | Mist roughens the metal; drops run down it in columns of hashed cells and wipe a clean trail behind them. Each drop tilts the normal like a small lens, so it catches the studio's panels.        |
| Wiping it off | A small screen-sized map remembers where the pointer passed and recovers a little every frame; the condensation reads it and clears mist and drops there.                                         |
| Label         | Colors come from the shader; only the lettering is a texture, drawn on a canvas at load in the page's own font. The letters are bare metal.                                                       |
| The drink     | No real volume: the backdrop, the surface and the fog all take their color from one function of look direction and depth, so they fade into one picture.                                          |
| Surface       | A swell of drifting noise layers with rings from popping bubbles. From above it mirrors the studio; from below it shows Snell's window onto the lid and the bright opening.                       |
| Bubbles       | One draw call of camera-facing squares; the vertex shader moves each along its path, the fragment shader draws a sphere's rim and highlight on it (an impostor).                                  |
| Caustics      | A procedural web of light that the surface focuses onto the fruit, filling a cone that widens down from the opening.                                                                              |
| Light shafts  | A few additive strips turned around their own axis to face the camera, flickering as the waves above break the light.                                                                             |
| Strawberries  | Seeds in pits, the paler shoulder and the cut face are all drawn in the shader, in the model's own space: no textures and no unwrapping. The same code lights them in the drink and on the floor. |

### Going through the surface

This is the hardest moment of the flight. How far the camera is into the drink is one value, shared by the surface, the backdrop, the fog and the postprocessing. It rises while the camera descends from the opening to the surface, so by the time the camera crosses it the screen is already all drink and the crossing shows no seam. A wash of froth in postprocessing covers the moment and hides the camera turning from looking down into the drink to looking up through it.

### Camera and scroll

The camera follows a curve through hand-placed poses; the position on the curve springs toward the current station, so it glides between stations instead of jumping. The curve threads the 2 cm opening, clear of the rim and the panel hanging in. On narrow, upright screens the lens widens to keep the composition and shifts the picture so the text and the subject do not overlap. With `prefers-reduced-motion` there is no flight: the picture dips to black and the camera jumps to the next station.

### Loading

The page, the loader and the text arrive first, in a small bundle; three.js and the scene are a separate download. The loader follows the real steps (the scene's code, the models, the first frame with every shader built), so nothing stalls once the can is on screen.

## Numbers

| What                                         | Measured                                         |
| -------------------------------------------- | ------------------------------------------------ |
| First download (page, text, loader)          | 74 KB of JS, gzipped                             |
| Scene (three.js, React Three Fiber, effects) | 329 KB of JS, gzipped                            |
| Models (can, strawberry), meshopt-compressed | 99 KB                                            |
| Fonts                                        | 53 KB (latin subsets of Oswald and Manrope)      |
| Frame rate                                   | a steady 60 FPS inside the drink on a Galaxy S25 |

## Tech

- **Vite**, **React 19**, **TypeScript**
- **three.js** with **React Three Fiber** and **drei**
- **postprocessing** with **@react-three/postprocessing**: bloom, vignette, ACES tone mapping, grain, and custom effects for the underwater sway, the froth of the dive and the fades to black
- **vite-plugin-glsl** for shaders in their own files
- **maath** for the springs, **Zustand** for the little state that the page and the scene share
- **Fontsource** for self-hosted fonts

## Running it

Needs Node 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm dev         # development server
pnpm typecheck   # type check without emitting files
pnpm build       # type check and production build into dist/
pnpm preview     # serve the production build
```

## Structure

```
src/
├── experience/   # everything 3D: camera, can, the inside of the drink, the end, postprocessing
├── shaders/      # GLSL, laid out like experience/
├── ui/           # everything HTML: header, stations, loader
├── store/        # state shared by the page and the scene
├── content/      # all text on the page
└── utils/        # small helpers shared across the project
public/
├── models/       # .glb, meshopt-compressed
└── licenses/     # font licenses and third-party notices
```

## Credits

- Models made in Blender for this project.
- Fonts: [Oswald](https://github.com/googlefonts/OswaldFont) and [Manrope](https://github.com/sharanda/manrope), both under the SIL Open Font License 1.1.
- MurmurHash3 finalizer by Austin Appleby, public domain, used for the condensation's random cells.

Full texts are in [`public/licenses/`](public/licenses/).

## Author

Made by Dzenis Gudzevic.
