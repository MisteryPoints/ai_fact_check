async function test() {
  try {
    const res = await fetch('http://localhost:3010/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweetUrl: 'https://x.com/smokelessworld/status/2041445618061840793' })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
