import {
  parse,
  stringify,
} from "https://deno.land/std@0.165.0/encoding/yaml.ts";
import { increment } from "https://deno.land/std@0.165.0/semver/mod.ts";

if (Deno.args.length !== 2) {
  console.error(
    `Exactly two arguments required: <path to Chart.yaml> <new app version>`,
  );
  Deno.exit(1);
}

const chartFilePath = Deno.args[0];
const newAppVersion = Deno.args[1];

const chart = parse(await Deno.readTextFile(chartFilePath)) as Record<
  string,
  unknown
>;
chart.appVersion = newAppVersion;
chart.version = increment(chart.version as string, "minor");
await Deno.writeTextFile(chartFilePath, stringify(chart));

console.log(
  `Set appVersion to ${chart.appVersion} and version to ${chart.version}`,
);
