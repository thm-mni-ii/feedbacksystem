// deno-lint-ignore-file no-explicit-any
import { stringify } from "https://deno.land/std@0.161.0/encoding/yaml.ts";
import { encode } from "https://deno.land/std@0.161.0/encoding/hex.ts";

function randomHex(lenght = 16): string {
  const bs = new Uint8Array(lenght);
  crypto.getRandomValues(bs);
  return new TextDecoder().decode(encode(bs));
}

function buildValues(): any {
  const host = new URL(prompt("Enter host:")!);

  const values: any = {
    common: {
      config: {
        protocol: host.protocol,
        hostname: host.hostname,
        port: host.port || 443,
      },
    },
    core: {
      config: {
        jwtSecret: randomHex(),
      },
    },
    mysql: {
      auth: {
        password: randomHex(),
        rootPassword: randomHex(),
      },
    },
    runnerMysql: {
      auth: {
        password: randomHex(),
        rootPassword: randomHex(),
      },
    },
    runnerPostgres: {
      auth: {
        password: randomHex(),
        postgresPassword: randomHex(),
      },
    },
    checkerMongodb: {
      auth: {
        password: randomHex(),
        postgresPassword: randomHex(),
      },
    },
    digitalClassroom: {
      enabled: false,
    },
  };

  if (confirm("Enable digital classroom:")) {
    values.digitalClassroom.enabled = true;
    values.digitalClassroom.config = {
      jwtSecret: randomHex(),
      secret: randomHex(),
      bbb: {
        url: prompt("Enter BBB Url:"),
        bbb: prompt("Enter BBB secret:"),
      },
    };
  }

  return values;
}

if (Deno.args.length < 1) {
  throw new Error("argument for output is required");
}

Deno.writeFileSync(
  Deno.args[0],
  new TextEncoder().encode(stringify(buildValues())),
);
