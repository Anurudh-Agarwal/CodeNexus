class RateLimiter {
  private queue: Array<() => void> = []
  private lastRun = 0
  private processing = false

  constructor(private minIntervalMs: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForTurn()
    return fn()
  }

  private waitForTurn(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve)
      this.processQueue()
    })
  }

  private processQueue() {
    if (this.processing) return
    this.processing = true

    const tick = () => {
      const next = this.queue.shift()
      if (!next) {
        this.processing = false
        return
      }
      const wait = Math.max(0, this.minIntervalMs - (Date.now() - this.lastRun))
      setTimeout(() => {
        this.lastRun = Date.now()
        next()
        tick()
      }, wait)
    }
    tick()
  }
}
export const codeforcesLimiter = new RateLimiter(2000)