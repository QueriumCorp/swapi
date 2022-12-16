'use strict'

const req = require("../../plugins/requestTimeout")

// const hasTimeoutError = function (text) {
//   const idx = text.toLowerCase().lastIndexOf("the system has timed out");
//   return idx > 0;
// };

// console.log(aiServer);
console.log("TESTING: requestTimeout.js");
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160867.json, reProcessLRV}, Null, {{Null, Null}, Null, Null}, [ERROR:START]{&quot;type&quot;:&quot;timeout&quot;,&quot;msg&quot;:&quot;The system has timed out&quot;,&quot;waitTime&quot;:13,&quot;correctStepQ&quot;:null,&quot;feedback&quot;:&quot;&quot;}[ERROR:END], Null}';
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160867.json, reProcessLRV}, Null, {{Null, Null}, Null, Null}, {&quot;timeoutMsg&quot;:&quot; system has timed out&quot;,&quot;waitTime&quot;:13,&quot;correctStepQ&quot;:null}, Null}';
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160868.json, reProcessLRV}, Null, {{Null, Null}, Null, Null}, [ERROR:START]{&quot;timeoutMsg&quot;:&quot;The system has timed out&quot;,&quot;waitTime&quot;:13,&quot;correctStepQ&quot;:null}[ERROR:END], Null}'
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160875.json, reProcessLRV}, Null, {{Null, Null}, Null, Null}, [ERROR:START]{&quot;type&quot;:&quot;timeout&quot;,&quot;msg&quot;:&quot;The system has timed out&quot;,&quot;waitTime&quot;:14,&quot;correctStepQ&quot;:false,&quot;feedback&quot;:&quot;That is not a correct step. Try again.&quot;}[ERROR:END], Null}'
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160875.json, reProcessLRV}, Null, {{Null, Null}, Null, Null}, [ERROR:START]{&quot;type&quot;:&quot;timeout&quot;,&quot;msg&quot;:&quot;The system has timed out&quot;,&quot;waitTime&quot;:14,&quot;correctStepQ&quot;:null,&quot;feedback&quot;:&quot;&quot;}[ERROR:END], Null}'
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160882.json, reProcessLRV}, Null, {{Null, Null}, Null, Null}, [ERROR:START]{&quot;type&quot;:&quot;timeout&quot;,&quot;msg&quot;:&quot;The system has timed out&quot;,&quot;waitTime&quot;:14,&quot;correctStepQ&quot;:false,&quot;feedback&quot;:&quot;That is not a correct step. Try again.&quot;}[ERROR:END], Null}'
let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/cacheQueue/QUESCUSTOMxEvanPolicyx17022020160883.json, processLRV}, Null, {{Null, Null}, Null, Null}, [ERROR:START]{&quot;type&quot;:&quot;timeout&quot;,&quot;msg&quot;:&quot;The system has timed out&quot;,&quot;waitTime&quot;:14,&quot;correctStepQ&quot;:true,&quot;feedback&quot;:&quot;Very good! That is a valid step, but not the final answer.&quot;}[ERROR:END], Null}'
// let responseText = '{{/var/lib/tomcat8/webapps/webMathematica/api/states/QUESCUSTOMxEvanPolicyx17022020160889.mx, processLRV}, Null, {{Null, Null}, Null, Null}, &quot;Keep it up!&quot;, Null}'

console.log("processTimeoutError: ");
console.log(req.processTimeoutError(responseText));
