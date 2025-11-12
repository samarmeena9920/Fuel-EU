(async () => {
  const fetch = globalThis.fetch;
  const base = 'http://localhost:5000';
  try {
    const r1 = await fetch(`${base}/api/compliance/cb?year=2024`);
    const j1 = await r1.json();
    console.log('/api/compliance/cb?year=2024 ->', JSON.stringify(j1, null, 2).slice(0, 1000));

    const r2 = await fetch(`${base}/api/compliance/adjusted-cb?year=2024`);
    const j2 = await r2.json();
    console.log('/api/compliance/adjusted-cb?year=2024 ->', JSON.stringify(j2, null, 2).slice(0, 1000));

    const r3 = await fetch(`${base}/api/routes`);
    const j3 = await r3.json();
    console.log('/api/routes ->', JSON.stringify(j3, null, 2).slice(0, 1000));
  } catch (e) {
    console.error('fetch error', e);
  }
})();
