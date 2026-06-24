import { getPayload } from "payload";
import config from "../src/payload.config.ts";
const p = await getPayload({ config });
const all = await p.count({ collection: "posts" });
const pub = await p.count({ collection: "posts", where: { _status: { equals: "published" } } });
const one = await p.find({
  collection: "posts",
  limit: 1,
  depth: 0,
  where: { slug: { equals: "post-9000" }, _status: { equals: "published" } },
});
console.log(JSON.stringify({ total: all.totalDocs, published: pub.totalDocs, post9000: one.docs[0]?.slug ?? null }));
process.exit(0);
