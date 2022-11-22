// deno-lint-ignore-file no-explicit-any
import { stringify } from "https://deno.land/std@0.161.0/encoding/yaml.ts";
import { encode } from "https://deno.land/std@0.161.0/encoding/hex.ts";

function randomHex(lenght = 16): string {
  const bs = new Uint8Array(lenght);
  crypto.getRandomValues(bs);
  return new TextDecoder().decode(encode(bs));
}

function buildValues(): any {
  const namespace = prompt("Namespace:");
  const name = prompt("Name: ");
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
    runner: {
      config: {
        hmacSecret: randomHex(),
      },
    },
    mysql: {
      auth: {
        password: randomHex(),
        rootPassword: randomHex(),
      },
      primary: {
        existingConfigmap: `${name}-mysql-config`,
      },
    },
    runnerMysql: {
      auth: {
        password: randomHex(),
        rootPassword: randomHex(),
      },
      primary: {
        existingConfigmap: `${name}-mysql-config`,
      },
    },
    runnerPostgres: {
      auth: {
        password: randomHex(),
        postgresPassword: randomHex(),
      },
    },
    runnerPlaygroundPostgres: {
      auth: {
        password: randomHex(),
        postgresPassword: randomHex(),
      },
    },
    checkerMongodb: {
      auth: {
        password: randomHex(),
        rootPassword: randomHex(),
      },
    },
    minio: {
      auth: {
        rootPassword: randomHex(),
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

  return { namespace, name, values };
}

if (Deno.args.length < 1) {
  throw new Error("argument for output is required");
}

const { name, namespace, values } = buildValues();

Deno.writeFileSync(
  Deno.args[0],
  new TextEncoder().encode(stringify(values)),
);

console.log(
  `Install with helm install -f ${
    Deno.args[0]
  } -n ${namespace} --create-namespace ${name} <chart name>`,
);
