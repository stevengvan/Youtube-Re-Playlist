const cacheName = "Youtube playlist rework";
const assets = ["/", "/index/index.html", "/main.js", "/styles.css"];

// Cache all the files to make a PWA
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      // Our application only has two files here index.html and manifest.json
      // but you can add more such as style.css as your app grows
      return cache.addAll(assets);
    })
  );
});
