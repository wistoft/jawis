module.exports = class {
  constructor() {
    console.log("exported class is constructed");
    this.instanceVariable = true;
  }
  static prop = "class property";
};
