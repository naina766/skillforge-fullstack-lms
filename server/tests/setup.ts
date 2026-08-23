import dns from 'dns';

// Ensure all Vitest integration tests use reliable public DNS resolvers for MongoDB Atlas SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in restricted environments
}
