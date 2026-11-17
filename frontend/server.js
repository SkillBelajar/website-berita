const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Frontend Next.js Setup (Versi 0.4)\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend dummy server berjalan di http://0.0.0.0:${PORT}`);
});
