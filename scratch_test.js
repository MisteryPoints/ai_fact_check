async function test() {
  const url = 'https://publish.twitter.com/oembed?url=https://x.com/smokelessworld/status/2041445618061840793';
  try {
    const res = await fetch(url);
    if (!res.ok) {
        console.error("HTTP error:", res.status);
        const text = await res.text();
        console.error("Body:", text);
        return;
    }
    const data = await res.json();
    console.log("Success! Data:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}
test();
