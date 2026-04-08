async function test() {
  try {
    const res = await fetch('https://api.fxtwitter.com/SpaceX/status/1768270598822981944');
    const data = await res.json();
    console.log(JSON.stringify(data.tweet.media, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
