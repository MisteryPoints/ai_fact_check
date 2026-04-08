async function test() {
  try {
    const res = await fetch('http://localhost:3010/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tweetUrl: 'https://x.com/SpaceX/status/1768270598822981944',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Starship_Flight_3_launch.jpg' // Using a public image for testing
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
