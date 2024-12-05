type SetTimeoutOptsType = {
  interval: number;
  cb: Function;
  curTick: number;
  loop?: boolean;
};

class TimerWorker {
  public tick = 0;
  private setTimeoutCallbackMap: Record<string, SetTimeoutOptsType> = {};
  private TIME_END = 24 * 24 * 60 * 60;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    const worker = new SharedWorker(
      new URL("../worker/timeWorker.js", import.meta.url),
      { type: "module", name: "globalTimerWorker" }
    );
    worker.port.onmessage = (e) => {
      this.tick = e.data;
      if (this.tick >= this.TIME_END) {
        this.tick = 0;
      }
      Object.keys(this.setTimeoutCallbackMap).forEach((key) => {
        const item = this.setTimeoutCallbackMap[key];
        if (this.tick >= item.curTick + item.interval / 1000) {
          item.cb();
          if (item.loop) {
            item.curTick = this.tick;
          } else {
            this.unsubscribe(key);
          }
        }
      });
    };
  }

  subscribe(opts: Omit<SetTimeoutOptsType, 'curTick'>) {
    const id = Date.now().toString(36) + ~~(Math.random() * 1000);
    this.setTimeoutCallbackMap[id] = {
      interval: opts.interval,
      cb: opts.cb,
      curTick: this.tick,
      loop: opts.loop,
    };
    return id;
  }

  unsubscribe(id: string) {
    delete this.setTimeoutCallbackMap[id];
  }
}

export const timerWorker = new TimerWorker();
