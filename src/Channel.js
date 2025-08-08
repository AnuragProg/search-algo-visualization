
class ChannelClosedError extends Error {
   constructor(message = 'Cannot send to a closed channel'){
      super(message);
      this.name = 'ChannelClosedError';
   }
}


/**
 * A simple async channel that you can send values into,
 * and asynchronously receive them in FIFO order.
 *
 * @template T
 */
class AsyncChannel {
   /**
      * Underlying buffer storing the sent items.
      * @type {T[]}
      */
   #buffer = [];

   /**
      * Async generator producing values from #buffer.
      * @type {AsyncGenerator<T, void, unknown>}
      */
   #bufferOut;

   /**
      * Resolver for the next receive when buffer is empty.
      * @type {(() => void) | null}
      */
   #resumeBuffer = null;

   #isClosed = false;

   constructor() {
      const self = this;
      // Immediately-invoked async generator bound to `self`
      /** @type {AsyncGenerator<T, void, unknown>} */
         this.#bufferOut = (async function* () {
            while (true) {
               if (self.#buffer.length > 0) {
                  yield /** @type {T} */ (self.#buffer.shift());
               } else {
                  // pause until send() calls resumeBuffer
                  await new Promise(resolve => {
                     self.#resumeBuffer = resolve;
                  });
               }
            }
         })();
   }

   /**
      * Pushes a value into the channel.
      * @param {T} data
      * @returns {void}
      */
   send(data) {
      if(this.#isClosed){
         throw new ChannelClosedError();
      }
      this.#buffer.push(data);
      if (this.#resumeBuffer) {
         this.#resumeBuffer();
         this.#resumeBuffer = null;
      }
   }

   /**
      * Asynchronously receives the next value.
      * If none is buffered yet, this will wait until send() is called.
      * @returns {Promise<{value: T, done: boolean}>}
      */
   async receive() {
      return await this.#bufferOut.next();
   }

   /**
      * Closes the channel and stops the internal generator.
      * Any pending receive() will be settled.
      * @returns {Promise<void>}
      */
   async close() {
      this.#isClosed = true;
      // tell the generator to return()
      await this.#bufferOut.return();
   }
}


export { AsyncChannel, ChannelClosedError };
