// Transcribes a video with Whisper on the GPU and writes word-level captions.
//   npm run transcribe -- public/<tema>/clip.mp4 es                              the raw footage
//   npm run transcribe -- public/<tema>/cut.mp4 es src/<tema>/captions-raw.json  the edit (QA + captions)
// Writes the JSON (Remotion Caption[], timestamps relative to that file; default
// transcript.json) and prints the words grouped by pauses, which is how takes and flubs
// become visible. Run it through tsx (npm run does): plain Node 22 has no `using`.
import { registerMediabunnyServer } from "@mediabunny/server";
import {
  WHISPER_WEBGPU_SAMPLE_RATE,
  canUseWhisperWebGpu,
  downloadWhisperModel,
  loadWhisperModel,
  toCaptions,
  transcribe,
} from "@remotion/whisper-webgpu";
import {
  ALL_FORMATS,
  Conversion,
  FilePathSource,
  Input,
  NullTarget,
  Output,
  WavOutputFormat,
} from "mediabunny";
import { writeFile } from "node:fs/promises";
import { currentReel } from "./reel.mjs";

const [file = `public/${currentReel()}/clip.mp4`, language = "es", out = "transcript.json"] =
  process.argv.slice(2);
// "small" is multilingual; English-only footage can use "small.en".
const model = language === "en" ? "small.en" : "small";

registerMediabunnyServer();

const support = await canUseWhisperWebGpu();
if (!support.supported) {
  throw new Error(`Whisper cannot use the GPU here: ${support.detailedReason}`);
}

type WaveformChunk = { startFrame: number; waveform: Float32Array };
const chunks: WaveformChunk[] = [];

using input = new Input({
  formats: ALL_FORMATS,
  source: new FilePathSource(file),
});
const audioTrack = await input.getPrimaryAudioTrack();
if (audioTrack === null) {
  throw new Error(`${file} has no audio track.`);
}

const conversion = await Conversion.init({
  input,
  output: new Output({
    format: new WavOutputFormat(),
    target: new NullTarget(),
  }),
  video: { discard: true },
  audio: (track) => {
    if (track.id !== audioTrack.id) {
      return { discard: true };
    }
    return {
      codec: "pcm-f32",
      forceTranscode: true,
      numberOfChannels: 1,
      sampleFormat: "f32",
      sampleRate: WHISPER_WEBGPU_SAMPLE_RATE,
      process: (sample) => {
        const waveform = new Float32Array(
          sample.allocationSize({ format: "f32", planeIndex: 0 }) /
            Float32Array.BYTES_PER_ELEMENT,
        );
        sample.copyTo(waveform, { format: "f32", planeIndex: 0 });
        chunks.push({
          startFrame: Math.round(sample.timestamp * WHISPER_WEBGPU_SAMPLE_RATE),
          waveform,
        });
        return sample;
      },
    };
  },
});
if (!conversion.isValid) {
  throw new Error(`The audio track of ${file} cannot be decoded.`);
}
await conversion.execute();

const length = chunks.reduce(
  (max, c) => Math.max(max, c.startFrame + c.waveform.length),
  0,
);
const channelWaveform = new Float32Array(length);
for (const chunk of chunks) {
  const destinationStart = Math.max(0, chunk.startFrame);
  const sourceStart = Math.max(0, -chunk.startFrame);
  const available = Math.min(
    chunk.waveform.length - sourceStart,
    channelWaveform.length - destinationStart,
  );
  if (available > 0) {
    channelWaveform.set(
      chunk.waveform.subarray(sourceStart, sourceStart + available),
      destinationStart,
    );
  }
}

await downloadWhisperModel({ model });
await using _modelHandle = await loadWhisperModel({ model });
const transcription = await transcribe({ channelWaveform, model, language });
const { captions } = toCaptions({ whisperWebGpuOutput: transcription });

await writeFile(out, JSON.stringify(captions, null, 2));

// A pause longer than 0.6 s starts a new line: retakes and flubs show up as repeated lines.
let line = "";
let lineStart = 0;
let lastEnd = -1;
for (const c of captions) {
  if (lastEnd >= 0 && c.startMs - lastEnd > 600) {
    console.log(`${(lineStart / 1000).toFixed(2).padStart(6)}s ${line.trim()}`);
    line = "";
  }
  if (line === "") {
    lineStart = c.startMs;
  }
  line += c.text;
  lastEnd = c.endMs;
}
if (line) {
  console.log(`${(lineStart / 1000).toFixed(2).padStart(6)}s ${line.trim()}`);
}
console.log(`\n${captions.length} words -> ${out}`);
