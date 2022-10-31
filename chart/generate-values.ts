// deno-lint-ignore-file no-explicit-any
import { stringify } from "https://deno.land/std@0.161.0/encoding/yaml.ts";
import { encode } from "https://deno.land/std@0.161.0/encoding/hex.ts";

function randomHex(lenght = 16): string {
  const bs = new Uint8Array(lenght);
  crypto.getRandomValues(bs);
  return new TextDecoder().decode(encode(bs));
}

const values: any = {
  common: {
    config: {
      hostname: prompt("Enter Hostname:"),
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

console.log(stringify(values));
