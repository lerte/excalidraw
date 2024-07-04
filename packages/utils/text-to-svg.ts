import { ExcalidrawTextElement, NonDeleted } from "../excalidraw/element/types";
import opentype, { Font } from "opentype.js";

import { DEFAULT_FONT_SIZE } from "../excalidraw/constants";

type Anchor =
  | "left baseline"
  | "left top"
  | "left bottom"
  | "left middle"
  | "center baseline"
  | "center top"
  | "center bottom"
  | "center middle"
  | "right baseline"
  | "right top"
  | "right bottom"
  | "right middle"
  | "baseline"
  | "top"
  | "bottom"
  | "middle"
  | "left"
  | "center"
  | "right";

// type Metrics = {
//   x: number;
//   y: number;
//   baseline: number;
//   width: number;
//   height: number;
//   ascender: number;
//   descender: number;
// };
type FontOptions = {
  /**
   * Horizontal position of the beginning of the text.
   * @default 0
   */
  x?: number | null | undefined;

  /**
   * Vertical position of the baseline of the text.
   * @default 0
   */
  y?: number | null | undefined;

  /**
   * Size of the text.
   * @default 72
   */
  fontSize?: number | null | undefined;

  /**
   * If true takes kerning information into account.
   * @default true
   */
  kerning?: boolean;

  /**
   * Letter-spacing value in em.
   */
  letterSpacing?: number;

  /**
   * Tracking value in (em / 1000).
   */
  tracking?: number;

  /**
   * @default "left baseline"
   */
  anchor?: Anchor;
};

interface GenerationOptions extends FontOptions {
  /**
   * Key-value pairs of attributes for `<path>` element.
   */
  attributes?: { [key: string]: string };
}
type LoadCallback = (error: Error | null, textToSVG: TextToSVG | null) => void;

function parseAnchorOption(anchor?: Anchor) {
  let horizontal: Anchor = "left";
  let vertical: Anchor = "baseline";
  if (anchor) {
    if (["left", "center", "right"].includes(anchor)) {
      horizontal = anchor;
    }
    if (["baseline", "top", "bottom", "middle"].includes(anchor)) {
      vertical = anchor;
    }
  }
  return { horizontal, vertical } as const;
}

export class TextToSVG {
  private font;
  constructor(font: Font) {
    this.font = font;
  }

  static loadSync(file: string): TextToSVG {
    return new TextToSVG(opentype.loadSync(file));
  }

  static load(url: string, cb: LoadCallback) {
    opentype.load(url, (err, font) => {
      if (err !== null) {
        return cb(err, null);
      }

      return cb(null, new TextToSVG(font!));
    });
  }

  getWidth(text: string, options: FontOptions) {
    const fontSize = options.fontSize ?? 72;
    const kerning = "kerning" in options ? options.kerning : true;
    const fontScale = (1 / this.font.unitsPerEm) * fontSize;

    let width = 0;
    const glyphs = this.font.stringToGlyphs(text);
    for (let i = 0; i < glyphs.length; i++) {
      const glyph = glyphs[i];

      if (glyph.advanceWidth) {
        width += glyph.advanceWidth * fontScale;
      }

      if (kerning && i < glyphs.length - 1) {
        const kerningValue = this.font.getKerningValue(glyph, glyphs[i + 1]);
        width += kerningValue * fontScale;
      }

      if (options.letterSpacing) {
        width += options.letterSpacing * fontSize;
      } else if (options.tracking) {
        width += (options.tracking / 1000) * fontSize;
      }
    }
    return width;
  }

  getHeight(fontSize: number) {
    const fontScale = (1 / this.font.unitsPerEm) * fontSize;
    return (this.font.ascender - this.font.descender) * fontScale;
  }

  getMetrics(text: string, options: FontOptions) {
    const fontSize = options.fontSize || DEFAULT_FONT_SIZE;
    const anchor = parseAnchorOption(options.anchor);

    const width = this.getWidth(text, options);
    const height = this.getHeight(fontSize);

    const fontScale = (1 / this.font.unitsPerEm) * fontSize;
    const ascender = this.font.ascender * fontScale;
    const descender = this.font.descender * fontScale;

    let x = options.x || 0;
    switch (anchor.horizontal) {
      case "left":
        x -= 0;
        break;
      case "center":
        x -= width / 2;
        break;
      case "right":
        x -= width;
        break;
      default:
        throw new Error(`Unknown anchor option: ${anchor.horizontal}`);
    }

    let y = options.y || 0;
    switch (anchor.vertical) {
      case "baseline":
        y -= ascender;
        break;
      case "top":
        y -= 0;
        break;
      case "middle":
        y -= height / 2;
        break;
      case "bottom":
        y -= height;
        break;
      default:
        throw new Error(`Unknown anchor option: ${anchor.vertical}`);
    }

    const baseline = y + ascender;

    return {
      x,
      y,
      baseline,
      width,
      height,
      ascender,
      descender,
    };
  }

  getD(text: string, options: GenerationOptions) {
    const fontSize = options.fontSize ?? 72;
    const kerning = "kerning" in options ? options.kerning : true;
    const letterSpacing =
      "letterSpacing" in options ? options.letterSpacing : undefined;
    const tracking = "tracking" in options ? options.tracking : undefined;
    const metrics = this.getMetrics(text, options);
    const path = this.font.getPath(
      text,
      metrics.x,
      metrics.baseline,
      fontSize,
      { kerning, letterSpacing, tracking }
    );

    return path.toPathData(1); // todo decimalPlaces
  }

  getPath(
    { text, strokeColor }: NonDeleted<ExcalidrawTextElement>,
    options: GenerationOptions
  ) {
    const attributes = Object.keys(options.attributes || {})
      // @ts-ignore
      .map((key) => `${key}="${options.attributes[key]}"`)
      .join(" ");
    const d = this.getD(text, options);

    if (attributes) {
      return `<path ${attributes} d="${d}"/>`;
    }

    return `<path fill="${strokeColor}" d="${d}"/>`;
  }

  getSVG(textElement: NonDeleted<ExcalidrawTextElement>) {
    const { fontSize } = textElement;
    const metrics = this.getMetrics(textElement.text, { fontSize });
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${metrics.width} ${metrics.height}">`;
    svg += this.getPath(textElement, { fontSize });
    svg += "</svg>";

    return svg;
  }
}
