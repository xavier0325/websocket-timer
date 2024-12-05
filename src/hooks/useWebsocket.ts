import { timerWorker } from "../TimerWorker/TimerWorker";

type Options = {
  url: string;
  reconnectCfg: {
    enable: boolean;
    timeout: number;
  };
  heartBeatInterval: number;
  heartBeatMessage: string;
  heartBeatTimeout?: number;
  onopen?: WebSocket["onopen"];
  onclose?: WebSocket["onclose"];
  onerror?: WebSocket["onerror"];
  onmessage?: WebSocket["onmessage"];
};

const defaultOptions: Options = {
  url: "",
  reconnectCfg: {
    enable: true,
    timeout: 1000,
  },
  heartBeatInterval: 5000,
  heartBeatMessage: "ping",
  heartBeatTimeout: 3000,
};
const URL_PREFIX = `${window.location.protocol === "https:" ? "wss" : "ws"}://${
  window.location.host
}`;
const socketMap: Record<string, WebSocket> = {};

export default function useWebsocket(options: Options): WebSocket {
  const opts = Object.assign({}, defaultOptions, options);

  const url = `${URL_PREFIX}${opts.url}`;
  let destroyFlag = false;
  let heartBeatTimer = "";
  let heartBeatTimeoutTimer: number;
  let socket: WebSocket | undefined;

  const heartBeat = () => {
    heartBeatTimer = timerWorker.subscribe({
      cb() {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(opts.heartBeatMessage);
          
          heartBeatTimeoutTimer = window.setTimeout(() => {
            console.warn('心跳响应超时，准备重连');
            destroyHeartBeat();
            destroySocket(url);
            newWs();
          }, opts.heartBeatTimeout);
        }
      },
      interval: opts.heartBeatInterval,
      loop: true,
    });
  };

  const clearHeartBeatTimeout = () => {
    if (heartBeatTimeoutTimer) {
      clearTimeout(heartBeatTimeoutTimer);
    }
  };

  const destroyHeartBeat = () => {
    clearHeartBeatTimeout();
    timerWorker.unsubscribe(heartBeatTimer);
  };

  const destroySocket = (_url: string) => {
    destroyFlag = true;
    if (socketMap[_url]) {
      socketMap[_url].close();
      delete socketMap[_url];
    }
  };

  const newWs = () => {
    try {
      if (socketMap[url]) {
        destroySocket(url);
      }
      socket = new WebSocket(url);
      socket.onopen = (...args) => {
        if (!destroyFlag) {
          heartBeat();
          opts.onopen?.apply(socket as WebSocket, args);
        } else if (socket) {
          socket.close();
        }
      };
      socket.onmessage = (...args) => {
        if (!destroyFlag) {
          clearHeartBeatTimeout();
          opts.onmessage?.apply(socket as WebSocket, args);
        }
      };
      socket.onclose = (...args) => {
        destroyHeartBeat();
        opts.onclose?.apply(socket as WebSocket, args);
        if (destroyFlag || !opts.reconnectCfg.enable) {
          destroySocket(url);
        } else {
          delete socketMap[url];
          heartBeatTimer = timerWorker.subscribe({
            cb: () => {
              newWs();
            },
            interval: opts.reconnectCfg.timeout,
          });
        }
      };
      socketMap[url] = socket;
    } catch (error) {
      destroyHeartBeat();
      heartBeatTimer = timerWorker.subscribe({
        cb: () => {
          newWs();
        },
        interval: opts.reconnectCfg.timeout,
      });
    }
  };
  newWs();

  window.addEventListener("beforeunload", () => {
    destroyHeartBeat();
    destroySocket(url);
  });

  return socket!;
}
