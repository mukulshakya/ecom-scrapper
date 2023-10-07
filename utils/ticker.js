const logger = require("debug")("scrapper:ticker");

class Ticker {
  constructor(handler, delay) {
    this.handler = handler;
    this.delay = delay;
  }

  async executeTask() {
    try {
      await this.handler();
    } catch (error) {
      // logger('err in ticker handler', error);
    } finally {
      this.scheduleTick();
    }
  }

  scheduleTick() {
    setTimeout(this.executeTask.bind(this), this.delay);
  }

  run() {
    logger("Ticker started running");
    this.executeTask();
  }
}

module.exports = Ticker;
