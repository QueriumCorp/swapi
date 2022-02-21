const util = require("../../routes/getHint/utils");

const testInput =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUESCUSTOMxevanx1645422277406.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "[ERRTYPE:START]advisory[ERRTYPE:END][ERRMSG:START]There are no more hints for this step. [ERRMSG:END] [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Factor each group.[HINTMSG:END] [HINTTYPE:START]writedown[HINTTYPE:END][HINTMSG:START]Write <math><semantics><mrow><mrow><mrow><mi>x</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow><mo>-</mo><mrow><mn>8</mn><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow></mrow><mo>=</mo><mn>0</mn></mrow></semantics></math> for your next step.[HINTMSG:END]"';
const testInput1 =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUESCUSTOMxevanx1645422277406.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "advisoryThere are no more hints for this step.  genhintFactor each group. writedownWrite <math><semantics><mrow><mrow><mrow><mi>x</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow><mo>-</mo><mrow><mn>8</mn><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow></mrow><mo>=</mo><mn>0</mn></mrow></semantics></math> for your next step."';

const result = util.parseResponse(testInput);
console.log(result);