import {Hocuspocus, onAuthenticatePayload, onConnectPayload} from "@hocuspocus/server";
import * as jose from 'jose'

const FBS_ROOT_URL = process.env.FBS_ROOT_URL ?? 'https://feedback.mni.thm.de';

const server = new Hocuspocus({
  port: 1234,
  async onAuthenticate(data: onAuthenticatePayload): Promise<any> {
    try {
      let userId;
      try {
        userId = jose.decodeJwt(data.token).id;
      } catch (e) {
        throw new Error("Unauthorized");
      }
      if (!userId) throw new Error("Unauthorized");
      const resp = await fetch(`${FBS_ROOT_URL}/api/v1/users/${userId}/groups`, {headers: {'Authorization': `Bearer ${data.token}`}});
      if (resp.status !== 200) throw new Error("Unauthorized");
      const body = await resp.json();
      const ok = Boolean(body.find(({id}: { id: string }) => id.toString() === data.documentName));
      if (!ok) throw new Error("Forbidden");
      return {user: {id: userId}};
    } catch (e) {
      console.log(e)
      throw e
    }
  },
});

server.listen();
