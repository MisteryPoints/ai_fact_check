async function test() {
  try {
    const tweetId = '1768270598822981944';
    const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
