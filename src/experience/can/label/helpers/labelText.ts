import { CanvasTexture, LinearMipmapLinearFilter } from 'three';
import '@fontsource-variable/oswald';

import { LABEL_TEXT } from '@/content/label';

const FONT_FAMILY = '"Oswald Variable"';

const LAYOUT = {
  /** Mask size (px); 1024 × 640 matches the block's 36 × 22.5 mm, about 28 px per mm. */
  width: 1024,
  height: 640,
  /** Title weight: bold, the one word that carries the can. */
  titleWeight: 700,
  /** Share of the mask width the title may take; the rest stays empty around it. */
  titleWidth: 0.9,
  /** Highest share of the mask height the title's capitals may take. */
  titleHeight: 0.62,
  /** Space between the title's letters (fraction of the font size). */
  titleTracking: 0.06,
  /** Subtitle weight: light, so it stays quiet under the title. */
  subtitleWeight: 300,
  /** Subtitle font size (fraction of the mask height). */
  subtitleSize: 0.1,
  /** Gap between the title and the subtitle (fraction of the mask height). */
  gap: 0.09,
  /** Smallest space between subtitle letters (fraction of its font size). */
  subtitleMinTracking: 0.12,
};

/** Width of a line drawn letter by letter with extra space between letters. */
const trackedWidth = (
  context: CanvasRenderingContext2D,
  text: string,
  spacing: number,
) =>
  [...text].reduce((sum, char) => sum + context.measureText(char).width, 0) +
  spacing * (text.length - 1);

// Letters are drawn one by one with manual spacing: canvas letterSpacing is
// not available in every browser this site supports.
const drawTracked = (
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  baseline: number,
  spacing: number,
) => {
  let x = centerX - trackedWidth(context, text, spacing) / 2;
  for (const char of text) {
    context.fillText(char, x, baseline);
    x += context.measureText(char).width + spacing;
  }
};

/**
 * Draws the label text into a mask: white letters on a transparent background,
 * title on top and a subtitle stretched to the title's width below it. Waits
 * for the font first, so the letters are never drawn in a fallback font.
 */
export const createLabelTextMask = async (maxAnisotropy: number) => {
  const { title, subtitle } = LABEL_TEXT;
  const { width, height } = LAYOUT;
  await Promise.all([
    document.fonts.load(`${LAYOUT.titleWeight} 100px ${FONT_FAMILY}`, title),
    document.fonts.load(
      `${LAYOUT.subtitleWeight} 100px ${FONT_FAMILY}`,
      subtitle,
    ),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Label text: 2D canvas is not available');
  context.fillStyle = '#ffffff';
  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';

  // Title: as large as fits both the width and the height share.
  const probe = 100;
  context.font = `${LAYOUT.titleWeight} ${probe}px ${FONT_FAMILY}`;
  const probeWidth = trackedWidth(context, title, probe * LAYOUT.titleTracking);
  const probeCap = context.measureText(title).actualBoundingBoxAscent;
  const titleSize = Math.min(
    (probe * width * LAYOUT.titleWidth) / probeWidth,
    (probe * height * LAYOUT.titleHeight) / probeCap,
  );
  context.font = `${LAYOUT.titleWeight} ${titleSize}px ${FONT_FAMILY}`;
  const titleSpacing = titleSize * LAYOUT.titleTracking;
  const titleWidth = trackedWidth(context, title, titleSpacing);
  const titleCap = context.measureText(title).actualBoundingBoxAscent;

  // Subtitle: spaced out to end exactly under the title's edges.
  const subtitleSize = height * LAYOUT.subtitleSize;
  context.font = `${LAYOUT.subtitleWeight} ${subtitleSize}px ${FONT_FAMILY}`;
  const plainWidth = trackedWidth(context, subtitle, 0);
  const subtitleSpacing = Math.max(
    (titleWidth - plainWidth) / (subtitle.length - 1),
    subtitleSize * LAYOUT.subtitleMinTracking,
  );
  const subtitleCap = context.measureText(subtitle).actualBoundingBoxAscent;

  // Both lines centered as one block.
  const gap = height * LAYOUT.gap;
  const top = (height - (titleCap + gap + subtitleCap)) / 2;
  const titleBaseline = top + titleCap;
  const subtitleBaseline = titleBaseline + gap + subtitleCap;

  context.font = `${LAYOUT.titleWeight} ${titleSize}px ${FONT_FAMILY}`;
  drawTracked(context, title, width / 2, titleBaseline, titleSpacing);
  context.font = `${LAYOUT.subtitleWeight} ${subtitleSize}px ${FONT_FAMILY}`;
  drawTracked(context, subtitle, width / 2, subtitleBaseline, subtitleSpacing);

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = maxAnisotropy;
  return texture;
};
