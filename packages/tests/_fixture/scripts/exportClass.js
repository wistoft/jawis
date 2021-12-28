module.exports = class {
  constructor() {
    console.log("exported class is contructed");
    this.instanceVariable = true;
  }
  static prop = "class property";
};
