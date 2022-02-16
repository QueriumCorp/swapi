const tap = require("tap");
const util = require("../../routes/submitStep/utils");

const testInput =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUES6018xevanx1644939566156.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "LOADS of people make that same error. See if you can fix it."';
const result = util.parseResponse(testInput);
console.log(result);

tap.equal(result.stepStatus, "INVALID");
