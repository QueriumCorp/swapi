const utilGetHint = require("../../routes/getHint/utils");
const utilSubmitStep = require("../../routes/submitStep/utils");
const utilSubAndHint = require("../../routes/submitAndGetHints/utils");
const he = require("he");

const cleanRspns = (arg) => {
  var resultStart = arg.indexOf("<result>") + 8;
  var resultEnd = arg.indexOf("</result>") - 8;
  return he.decode(arg.slice(resultStart, resultEnd));
}

const testInput =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUESCUSTOMxevanx1645422277406.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "[ERRTYPE:START]advisory[ERRTYPE:END][ERRMSG:START]There are no more hints for this step. [ERRMSG:END] [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Factor each group.[HINTMSG:END] [HINTTYPE:START]writedown[HINTTYPE:END][HINTMSG:START]Write <math><semantics><mrow><mrow><mrow><mi>x</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow><mo>-</mo><mrow><mn>8</mn><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow></mrow><mo>=</mo><mn>0</mn></mrow></semantics></math> for your next step.[HINTMSG:END]"';

const testInput1 =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUESCUSTOMxevanx1645422277406.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "advisoryThere are no more hints for this step.  genhintFactor each group. writedownWrite <math><semantics><mrow><mrow><mrow><mi>x</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow><mo>-</mo><mrow><mn>8</mn><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow></mrow><mo>=</mo><mn>0</mn></mrow></semantics></math> for your next step."';

const testInput2 =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUESCUSTOMxevanx1645422277406.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "[FBTTYPE:START]encouraging[FBTTYPE:END][FBMSG:START]Wrong turn. Check your work and see if you can get yourself back on track.[FBMSG:END] [ERRTYPE:START]advisory[ERRTYPE:END][ERRMSG:START]There are no more hints for this step. [ERRMSG:END] [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Factor each group.[HINTMSG:END] [HINTTYPE:START]writedown[HINTTYPE:END][HINTMSG:START]Write <math><semantics><mrow><mrow><mrow><mi>x</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow><mo>-</mo><mrow><mn>8</mn><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>-</mo><mn>1</mn></mrow><mo>)</mo></mrow></mrow></mrow><mo>=</mo><mn>0</mn></mrow></semantics></math> for your next step.[HINTMSG:END]"';

const testInput3 =
  '{{/var/lib/tomcat8/webapps/webMathematica/api/states/solveequationsthatrequiresimplificationusingthesubtractionandadditionpropertiesofequality10115662SWxrobaktivcomx1651526283232.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, "[FBTTYPE:START]encouraging[FBTTYPE:END][FBMSG:START]Wrong turn. Check your work and see if you can get yourself back on track.[FBMSG:END] [ERRTYPE:START]arithmetic mistake[ERRTYPE:END][ERRMSG:START] Watch for arithmetic errors[ERRMSG:END].  [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Apply the distributive property.[HINTMSG:END] [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Replace <math><semantics><mrow><mi>a</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mo>)</mo></mrow></mrow></semantics></math>  by  %5C(a x + a y%5C).[HINTMSG:END] [HINTTYPE:START]writedown[HINTTYPE:END][HINTMSG:START]Write <math><semantics><mrow><mrow><mrow><mn>4</mn><mi>n</mi></mrow><mo>-</mo><mrow><mn>27.6</mn><mtext>&#8202;</mtext></mrow><mo>-</mo><mrow><mn>3</mn><mi>n</mi></mrow></mrow><mo>=</mo><mn>3.4</mn></mrow></semantics></math> for your next step.[HINTMSG:END]", Null}';

const testInput4 = '"[FBTTYPE:START]encouraging[FBTTYPE:END][FBMSG:START]Wrong turn. Check your work and see if you can get yourself back on track.[FBMSG:END] [ERRTYPE:START]arithmetic mistake[ERRTYPE:END][ERRMSG:START] Watch for arithmetic errors.[ERRMSG:END]  [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Apply the distributive property.[HINTMSG:END] [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Replace <math><semantics><mrow><mi>a</mi><mspace width=\'.04em\'/><mrow><mo>(</mo><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mo>)</mo></mrow></mrow></semantics></math>  by  %5C(a x + a y%5C).[HINTMSG:END] [HINTTYPE:START]writedown[HINTTYPE:END][HINTMSG:START]Write <math><semantics><mrow><mrow><mrow><mn>4</mn><mi>n</mi></mrow><mo>-</mo><mrow><mn>27.6</mn><mtext>&#8202;</mtext></mrow><mo>-</mo><mrow><mn>3</mn><mi>n</mi></mrow></mrow><mo>=</mo><mn>3.4</mn></mrow></semantics></math> for your next step.[HINTMSG:END]"'

const testInput5 = '"<result>{{/var/lib/tomcat8/webapps/webMathematica/api/states/solveasystemoflinearequationsusingthesubstitutionmethod5758019SWxebTest0606x1654784930386.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, &quot;[FBTTYPE:START]encouraging[FBTTYPE:END][FBMSG:START]Advisory:  y is not a variable in this problem.   [FBMSG:END] [HINTTYPE:START]transitionhint[HINTTYPE:END][HINTMSG:START]If you don&apos;t see how to fix this, start from your last correct step. [HINTMSG:END] [HINTTYPE:START]advisory[HINTTYPE:END][HINTMSG:START]No hints are available for this step.[HINTMSG:END]&quot;, Null}</result>"'

const testInput51 = '"{{/var/lib/tomcat8/webapps/webMathematica/api/states/solveasystemoflinearequationsusingthesubstitutionmethod5758019SWxebTest0606x1654784930386.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, &quot;[FBTTYPE:START]encouraging[FBTTYPE:END][FBMSG:START]Advisory:  y is not a variable in this problem.   [FBMSG:END] [HINTTYPE:START]transitionhint[HINTTYPE:END][HINTMSG:START]If you don&apos;t see how to fix this, start from your last correct step. [HINTMSG:END] [HINTTYPE:START]advisory[HINTTYPE:END][HINTMSG:START]No hints are available for this step.[HINTMSG:END]&quot;, Null}"'

const testInput6 = '"{{/var/lib/tomcat8/webapps/webMathematica/api/states/findtheinterceptsfromanequationofaline58030614SWx627e66e048ceb0198f8d06b1x1654788409254.mx, reProcessLRV}, Null, {{Null, Null}, Null, Null}, &quot;[FBTTYPE:START]encouraging[FBTTYPE:END][FBMSG:START]That step had a mistake in it. See if you can find it![FBMSG:END] [ERRTYPE:START]errgen[ERRTYPE:END][ERRMSG:START]You should have an equation in %5C(x%5C) not the %5C(y%5C).[ERRMSG:END] [HINTTYPE:START]transitionhint[HINTTYPE:END][HINTMSG:START]If you don&apos;t see how to fix this, start over and: [HINTMSG:END] [HINTTYPE:START]genhint[HINTTYPE:END][HINTMSG:START]Set %5C(y%5C) to 0 and solve for %5C(x%5C) to find the %5C(x%5C)-intercept.[HINTMSG:END] [HINTTYPE:START]writedown[HINTTYPE:END][HINTMSG:START]Write &lt;math&gt;&lt;semantics&gt;&lt;mrow&gt;&lt;mrow&gt;&lt;mrow&gt;&lt;mn&gt;8&lt;/mn&gt;&lt;mrow&gt;&lt;mo&gt;&amp;#8289;&lt;/mo&gt;&lt;mo&gt;(&lt;/mo&gt;&lt;mn&gt;0&lt;/mn&gt;&lt;mo&gt;)&lt;/mo&gt;&lt;/mrow&gt;&lt;/mrow&gt;&lt;mo&gt;-&lt;/mo&gt;&lt;mi&gt;x&lt;/mi&gt;&lt;/mrow&gt;&lt;mo&gt;=&lt;/mo&gt;&lt;mrow&gt;&lt;mo&gt;-&lt;/mo&gt;&lt;mn&gt;18&lt;/mn&gt;&lt;/mrow&gt;&lt;/mrow&gt;&lt;/semantics&gt;&lt;/math&gt; for your next step.[HINTMSG:END]&quot;, Null}"'

const result = utilSubAndHint.hintsInResponse(cleanRspns(testInput6));
console.log(result);

// const result = util.parseResponse(testInput51);
// const cleanResp = cleanRspns(testInput5)
// const result = utilSubmitStep.parseResponse(cleanResp);
// console.log(result);
// const tmp = utilSubAndHint.hintsInResponse(cleanResp);
// console.log(tmp);

// const result2 = utilGetHint.parseResponse(testInput4);
// console.log(result2);