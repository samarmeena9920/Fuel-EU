(async () => {
  const base = 'http://localhost:5000';
  const payload = {
    year: 2024,
    members: [
      { shipId: 'SHIP006', cbBefore: 400 },
      { shipId: 'SHIP007', cbBefore: 200 },
      { shipId: 'SHIP005', cbBefore: 120 },
    ]
  };

  try {
    const res = await fetch(`${base}/api/pools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    console.log('create pool response:', res.status, JSON.stringify(json, null, 2).slice(0,2000));
  } catch (e) {
    console.error('error creating pool', e);
  }
})();
