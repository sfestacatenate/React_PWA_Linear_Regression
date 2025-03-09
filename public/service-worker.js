import { precacheAndRoute } from 'workbox-precaching';

// Precache automatico dei file generati da Vite
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
});
