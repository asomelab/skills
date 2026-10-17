import type { Caption } from "@remotion/captions";
import React, { useMemo } from "react";
import {
  interpolate,
  Interactive,
  useCurrentFrame,
  useVideoConfig,
  type InteractiveTransformProps,
  type InteractivitySchema,
  type SequenceProps,
} from "remotion";
import { color, ease, font } from "./brand";

// Brand captions: Inter SemiBold in White Smoke, left-aligned, living in the photo
// gradient. Phrases break where `pageBreakAfter` says (edited by hand, not by timer).
// Each word fades up as it is spoken; `highlights` (1-4 words per phrase) go Cornflower.

type CaptionsProps = InteractiveTransformProps &
  Pick<SequenceProps, "width"> & {
    readonly captions: Caption[];
    readonly highlights?: string[];
  };

const HOLD_MS = 700;
const FADE_MS = 140;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const toPages = (captions: Caption[]) => {
  const pages: Caption[][] = [];
  let current: Caption[] = [];
  captions.forEach((c, i) => {
    current.push(c);
    if (c.pageBreakAfter || i === captions.length - 1) {
      pages.push(current);
      current = [];
    }
  });
  return pages;
};

// Indexes of the page's words that belong to a highlighted phrase.
const highlightedIndexes = (page: Caption[], highlights: string[]) => {
  const words = page.map((c) => normalize(c.text));
  const marked = new Set<number>();
  highlights.forEach((phrase) => {
    const target = phrase.split(/\s+/).map(normalize);
    for (let i = 0; i + target.length <= words.length; i++) {
      if (target.every((w, k) => words[i + k] === w)) {
        target.forEach((_, k) => marked.add(i + k));
      }
    }
  });
  return marked;
};

const captionsSchema = {
  ...Interactive.captionsSchema,
  width: {
    type: "number",
    min: 1,
    step: 1,
    default: undefined,
    description: "Caption area width",
    hiddenFromList: false,
  },
} as const satisfies InteractivitySchema;

const CaptionsContent: React.FC<CaptionsProps> = ({
  captions,
  highlights = [],
  style,
  width = 760,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pages = useMemo(() => toPages(captions), [captions]);
  const t = (frame / fps) * 1000;

  const index = pages.filter((p) => p[0].startMs <= t).length - 1;
  const page = index === -1 ? null : pages[index];
  const next = pages[index + 1];
  const pageEnd = page
    ? Math.min(
        next ? next[0].startMs : Infinity,
        page[page.length - 1].endMs + HOLD_MS,
      )
    : 0;
  const marked = page
    ? highlightedIndexes(page, highlights)
    : new Set<number>();

  return (
    <div style={{ width, ...style }}>
      {page && t < pageEnd ? (
        <div
          style={{
            color: color.whiteSmoke,
            fontFamily: font.text,
            fontWeight: 600,
            fontSize: 50,
            lineHeight: "64px",
            letterSpacing: "-0.005em",
            textWrap: "pretty",
            opacity: interpolate(t, [pageEnd - FADE_MS, pageEnd], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {page.map((c, i) => (
            <React.Fragment key={c.startMs}>
              {i > 0 ? " " : null}
              <span
                style={{
                  display: "inline-block",
                  color: marked.has(i) ? color.cornflower : undefined,
                  opacity: interpolate(
                    t,
                    [c.startMs - 60, c.startMs + 120],
                    [0, 1],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    },
                  ),
                  translate: interpolate(
                    t,
                    [c.startMs - 60, c.startMs + 240],
                    ["0px 10px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: ease.out,
                    },
                  ),
                }}
              >
                {c.text.trim()}
              </span>
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const Captions = Interactive.withSchema({
  Component: CaptionsContent,
  componentName: "<Captions>",
  schema: captionsSchema,
  wrapInSequence: true,
});
