# Lessons from the "Consejo" reel (2026-10-17)

ASOME's own talking-head reel ("No contrates un software si…"): one raw 186 s vertical take
full of retakes, cut to ~76 s. The first cut was rejected; the second was accepted. This is
what changed, so the next reel starts from the second cut.

## What the user rejected in the first cut

| Problem | Why it happened | Fix (now in the skill) |
|---|---|---|
| The hook was said twice ("Soy dueño de una…" + the full line) | A false start hid behind a transcript that read clean | Compare take onsets with RMS + zero-crossing rate (`analyze zcr`) |
| A rounded box framing the face ("no me gusta el recuadro") | The old speaker-card recipe | Split screen: motion above, speaker full width below |
| Glances away from the lens and long silences | In/out points taken from Whisper times | Face contact sheets (`analyze faces`); cuts on the 10 ms envelope (`analyze bounds`) |
| Clips "muy mal sincronizados", "forzado" | Hard jump cuts plus a 1.0 / 1.08 alternating punch-in | 4–6 frame dissolves + audio crossfades; no punch-ins |
| Motion on every sentence | 2–4 card moments per 30 s | 1–2 split moments per reel, only where they add something |

The user asked for: a split screen only where it helps, subtle mixing between clips, and a
speech that reads as one coherent thought.

## The pipeline that worked

1. Transcribe the raw take (Whisper small, Spanish) to find the candidate lines.
2. For each line pick the last complete clean take. Check the head of each take for a restart:
   an /s/ onset is ~0.1 s of high zero-crossing rate followed by a loud vowel; the same pattern
   twice in a row means the speaker started over.
3. Put every in and out point in a silence measured on a 10 ms RMS envelope: Whisper end times
   run long on held words. Tighten pauses over ~0.3 s; leave ~0.2–0.25 s between sentences.
4. Gaze: face crops at 4 fps over every kept range (128 px tiles, labelled with the second);
   8–30 fps around doubtful spots. End each take before the head drops or the eyes leave the
   lens; prefer a clean alternate take.
5. Coherence: concatenate the kept audio, re-transcribe it, read it as a viewer would.
6. Never decide a boundary under 0.1 s with Whisper. It invents words over breaths and
   suspended intonation ("cosas en…", "en tu casa"). Use the envelope and the zero-crossing
   rate. Two words that coarticulate with no gap ("cosas en") cannot be cut apart: keep the
   whole phrase to a real pause.
7. Pre-cut one continuous file instead of stacking trimmed sequences: one `-ss/-t` input per
   piece, concatenated; the audio mixed sample-exact in Node with an equal-power crossfade at
   every cut and loud breaths lowered 12 dB; a second "blend" file with the frames each
   dissolve needs, faded in Remotion. Check frame-exactness against source stills.
8. Composition: the speaker full frame with brand captions; 2 split screens (the speaker's own
   calculation, and what ASOME does); captions hidden during the split; the layout move opens
   6 frames before a cut and settles 12 after.
9. Cover: a serious neutral frame ("foto carnet") and a mid-word frame were both rejected; the
   accepted one has the eyes open to the lens, the mouth closed and a relaxed slight smile.
   Show a sheet of 6 options and let the user pick.
10. The end card slid in on a transparent sheet with the card mounted late: the slide was
    invisible and the card popped in a second late. The sheet must be opaque Penn Blue and the
    card must mount at frame 0 inside it.

## Numbers worth keeping

| Item | Value |
|---|---|
| Envelope window | 10 ms RMS |
| Pause inside a take, tightened above | ~0.3 s |
| Pause between sentences after the cut | 0.2–0.25 s |
| Audio crossfade at a cut | ±60 ms, equal-power |
| Dissolve | 6 frames between takes, 4 inside one take |
| Breath duck | −12 dB, 20 ms ramps |
| Split move | opens 6 frames before the cut, settles 12 after |
| Split moments | 2 in ~76 s |
| Music bed | 0.10 under the voice, 0.30 on the end card |
