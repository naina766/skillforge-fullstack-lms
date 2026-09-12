import https from 'https';

https.get('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80', (res) => {
  console.log('AI Image 1 Status:', res.statusCode);
});

https.get('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', (res) => {
  console.log('AI Image 2 Status:', res.statusCode);
});
