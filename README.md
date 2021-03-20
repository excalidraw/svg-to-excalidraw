# svg-to-excalidraw

Library to convert SVG to Excalidraw’s file format.

## :floppy_disk: Installation

```bash
yarn add svg-to-excalidraw
```

## :beginner: Usage

```typescript
import svgToEx from "svg-to-excalidraw";

const heartSVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M 10,30
           A 20,20 0,0,1 50,30
           A 20,20 0,0,1 90,30
           Q 90,60 50,90
           Q 10,60 10,30 z"/>
</svg>
`;

function convertAndCopyToClipboard(svgString) {
  const { hasErrors, errors, content } = svgToEx.convert(svgString);

  // SVG parsing errors are propagated through.
  if (hasErrors) {
    console.error(errors);
    return;
  }

  navigator.clipboard.writeText(content);
}
```

## :game_die: Running tests

TODO.

### :building_construction: Local Development

#### Building the Project

```bash
yarn build

# Build and watch whenever a file is updated
yarn build:watch
```

## :busts_in_silhouette: Contributing

Pull requests are welcome. For major changes, please [open an issue](https://github.com/excalidraw/svg-to-excalidraw/issues) first to discuss what you would like to change.
