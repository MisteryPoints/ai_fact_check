async function test() {
  try {
    const tweetUrl = 'https://x.com/SpaceX/status/1768270598822981944';
    // Convert x.com or twitter.com to api.vxtwitter.com
    const apiUrl = tweetUrl.replace(/https:\/\/(x\.com|twitter\.com)/, 'https://api.vxtwitter.com');
    const res = await fetch(apiUrl);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
