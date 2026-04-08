async function test() {
  try {
    const res = await fetch('https://publish.twitter.com/oembed?url=https://x.com/SpaceX/status/1768270598822981944');
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}
test();
