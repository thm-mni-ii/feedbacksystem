import crypto from "node:crypto";

const base64Url = (buffer) =>
    buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

const verifier = base64Url(
    crypto.randomBytes(32)
);

const challenge = base64Url(
    crypto
        .createHash("sha256")
        .update(verifier, "ascii")
        .digest()
);

const state = base64Url(
    crypto.randomBytes(32)
);

console.log(`Code verifier:  ${verifier}`);
console.log(`Code challenge: ${challenge}`);
console.log(`State:          ${state}`);
