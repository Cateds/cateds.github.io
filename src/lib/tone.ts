import { Blend } from "$mcu/blend/blend.js";
import { Hct } from "$mcu/hct/hct.js";
import { TonalPalette } from "$mcu/palettes/tonal_palette.js";
import { argbFromHex, hexFromArgb } from "$mcu/utils/string_utils.js";

/** Theme sources colors are harmonized toward: Nord frost by day, starlight gold by night. */
const DAY_SOURCE = argbFromHex("#5e81ac");
const NIGHT_SOURCE = argbFromHex("#d9bf86");

function palette(seed: number, source: number, chroma: [number, number]) {
  const hct = Hct.fromInt(Blend.harmonize(seed, source));
  const c = Math.min(Math.max(hct.chroma, chroma[0]), chroma[1]);
  return TonalPalette.fromHueAndChroma(hct.hue, c);
}

/**
 * Turn a raw config hex into a Material-You-style tone set, as inline CSS
 * custom properties. Day and night tones are both emitted; global.css picks
 * the active set via [data-theme]. Computed at build time only.
 */
export function toneStyle(hex: string | undefined, fallback = "#5e81ac"): string {
  const seed = argbFromHex(hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : fallback);
  const day = palette(seed, DAY_SOURCE, [28, 52]);
  const night = palette(seed, NIGHT_SOURCE, [14, 30]);
  const t = (p: TonalPalette, tone: number) => hexFromArgb(p.tone(tone));

  return [
    `--tone-ink-day:${t(day, 38)}`,
    `--tone-line-day:${t(day, 62)}`,
    `--tone-wash-day:${t(day, 94)}`,
    `--tone-ink-night:${t(night, 84)}`,
    `--tone-line-night:${t(night, 64)}`,
    `--tone-wash-night:${t(night, 22)}`,
  ].join(";");
}
