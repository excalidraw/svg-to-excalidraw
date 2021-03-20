declare module "svg-to-excalidraw" {
  export type ConversionResult = {
    hasErrors: boolean;
    errors: NodeListOf<Element> | null;
    content: any; // Serialized Excalidraw JSON
  };

  export function convert(svgString: string): ConversionResult;
}
