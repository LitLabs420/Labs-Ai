import { connect, StringCodec, JetStreamClient, consumerOpts } from "nats";

const sc = StringCodec();
let js: JetStreamClient;

export async function initJetStream() {
  if (js) return js;
  const nc = await connect({ servers: process.env.NATS_URL! });
  js = nc.jetstream();
  return js;
}

export async function publish(subject: string, payload: any) {
  const js = await initJetStream();
  await js.publish(subject, sc.encode(JSON.stringify(payload)));
}

export async function subscribeDurable(subject: string, durable: string, handler: (d:any)=>Promise<void>) {
  const js = await initJetStream();
  const opts = consumerOpts();
  opts.durable(durable);
  opts.manualAck();
  const sub = await js.subscribe(subject, opts);

  (async()=>{
    for await (const m of sub) {
      try {
        await handler(JSON.parse(sc.decode(m.data)));
        m.ack();
      } catch (e) {
        console.error("NATS_HANDLER_ERROR", e);
      }
    }
  })();
}