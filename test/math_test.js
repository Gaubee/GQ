var math = require("mathjs");
// math.__proto__ = Math;
// console.log(math.eval("0.1+0.2"));
// console.log(Number.MAX_VALUE);

console.log(math.chain(0.1)
    .add(0.2));
