const ports = [];
let timer = null;
let workerTime = 0;

if (!timer) {
  timer = setInterval(() => {
    workerTime++;
    ports.forEach((p) => p.port.postMessage(workerTime));
  }, 1000);
}

self.onconnect = (event) => {
  const port = event.ports[0];
  const id = Date.now().toString(36) + ~~(Math.random() * 1000);
  ports.push({ id, port });
  port.addEventListener("message", (e) => {
    if (e.data.type === "close") {
      port.close();
      const idx = ports.findIndex((p) => p.id === id);
      if (idx > -1) {
        ports.splice(idx, 1);
      }
    }
  });
};
