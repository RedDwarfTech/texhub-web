class OutputScale {
    sx: any;
    sy: any;
    constructor() {
      const pixelRatio = window.devicePixelRatio || 1;
  
      /**
       * @type {number} Horizontal scale.
       */
      this.sx = pixelRatio;
  
      /**
       * @type {number} Vertical scale.
       */
      this.sy = pixelRatio;
    }
  
    /**
     * @type {boolean} Returns `true` when scaling is required, `false` otherwise.
     */
    get scaled() {
      return this.sx !== 1 || this.sy !== 1;
    }
}