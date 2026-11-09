fetch('http://localhost:3000/api/v1/health').then(r => r.text()).then(console.log).catch(e => { console.error(e); process.exit(1); });
