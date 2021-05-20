// TODO Jim - here are my notes on how I resolved global usage
// angular - resolved - not needed after converting from an angular module
// performance - no need to resolve yet - is a web global but will only work on web
// firebase - resolved - removed all refs - (you will probably want to add this back)
// querium - resolved - not needed after firebase code removed -  (you will probably want to add this back)

// TODO Jim - here are my notes on how I resolved the angular module dependencies
// $http - resolved - modified all to axios - this works the same way
// $q - did NOT resolve yet - probably you will want to either find a third part defer package or refactor the code that uses defers
// $rootScope - did NOT resolve yet - wasn't sure if I could remove the referencing code - I think it's fine though

import axios from "axios"; // TODO Jim - I installed a new npm/yarn dependency "axios", which works just like $http

console.info('hello world 1.6.9.1')

// TODO Jim - I removed everything to do with firebase & qEvalLogging, since we weren't going to need that. You'll probably want to add it back for your own purposes.

// TODO Jim - I made this a function in order to remove the module scope ref to tmpServer
const qEvalServer = () => {
    let tmpServer = localStorage.getItem('server')
    if (tmpServer == 'https://stepwise.querium.com/api/') {
        localStorage.removeItem('server')
        tmpServer = null
    }
    return (tmpServer === undefined || tmpServer === null || tmpServer.length === 0 ? 'https://stepwise.querium.com/webMathematica/api/' : tmpServer)
}

//---------------------------------------------------------------------
// START SESSION
//---------------------------------------------------------------------
export const startSession = function (
    qqKey: string,
    sessionCode: string,
    student: string,
    problemClass: string,
    problemDef: string,
    policy: string,
    qs1: string,
    qs2: string,
    qs3: string
) {
    const tmpServer: string | undefined | null = localStorage.getItem('server')

    const qEvalServer: string = (tmpServer === undefined || tmpServer === null || tmpServer.length === 0 ? 'https://stepwise.querium.com/webMathematica/api/' : tmpServer)

    qs1 = (typeof qs1 === 'undefined' ? '' : qs1)
    qs2 = (typeof qs2 === 'undefined' ? '' : qs2)
    qs3 = (typeof qs3 === 'undefined' ? '' : qs3)

    /* Warning: qEval does case-sensitive replacement of percent escapes, and expects lower case letters e.g. %2b NOT %2B */
    const url: string = qEvalServer + '?appKey=' + qqKey +
        '&cmd=initializeSession' + '&session=' + encodeURIComponent(sessionCode) +
        '&class=' + encodeURIComponent(problemClass) +
        '&question=' + problemDef.replace(/\+/g, '%252b').replace(/\&/g, '%2526').replace(/\^/g, '%255e').replace(/{/g, '%7b').replace(/}/g, '%7d').replace(/\|/g, '%7c') +
        '&policies=' + (policy.length ? encodeURIComponent(policy.replace(/\+/g, '%2b').replace(/\&/g, '%26')) : 'undefined') +
        '&qs1=' + (qs1.length ? encodeURIComponent(qs1.replace(/\+/g, '%2b').replace(/\&/g, '%26')) : 'undefined') +
        '&qs2=' + (qs2.length ? encodeURIComponent(qs2.replace(/\+/g, '%2b').replace(/\&/g, '%26')) : 'undefined') +
        '&qs3=' + (qs3.length ? encodeURIComponent(qs3.replace(/\+/g, '%2b').replace(/\&/g, '%26')) : 'undefined')

    const responsePromise: Promise<any> = axios.get(url)

    logQEvalActivity(true, {
        server: qEvalServer,
        command: 'initializeSession',
        sessionCode: sessionCode,
        qqKey: qqKey,
        student: student,
        problemClass: problemClass,
        problemDef: problemDef,
        policy: policy,
        qs1: qs1,
        qs2: qs2,
        qs3: qs3,
        data: url
    })

    return (responsePromise.then(startSessionHandleSuccess, startSessionHandleError))
}

function startSessionHandleSuccess(response: any) {
    logQEvalActivity(false, {
        command: 'initializeSession',
        data: response
    })

    const result = cleanResponse(response.data)

    // get the mathML
    const mathMLstart = result.indexOf('<math>')
    const mathMLend = result.indexOf('</math>') + 7
    let mathML = result.slice(mathMLstart, mathMLend)
    mathML = mathML.replace(/mtablerowspacing/g, 'mtable rowspacing')

    // get identifiers and operators
    const ids = getIdentifiers(result)
    const ops = getOperators(result)

    response = {
        status: 200,
        mathml: mathML,
        identifiers: ids,
        operators: ops
    }
    return response
}

function startSessionHandleError(response: any) {
    logQEvalActivity(false, {
        command: 'initializeSession',
        data: response
    })
    return response
}

//---------------------------------------------------------------------
// SUBMIT STEP
//---------------------------------------------------------------------
export const submitStep = function (qqKey: string, sessionCode: string, theStep: string) {
    const theStepPre: string = theStep
    if (theStep.indexOf('MathML') > -1) {
        theStep = cleanMathML(theStep)
    } else {
        theStep = cleanLaTeX(theStep)
    }

    const url = qEvalServer() + '?appKey=' + qqKey + '&cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + theStep

    const printascii = /^[ -~]+$/ // KAF
    if (!printascii.test(url)) { // KAF
        console.info('***** URL string has non-printing ascii characters or non-ascii characters *****') // KAF
    } // KAF

    const promise: Promise<any> = axios.get(url)

    logQEvalActivity(true, {
        server: qEvalServer(),
        command: 'processLRV',
        sessionCode: sessionCode,
        qqKey: qqKey,
        data: url,
        step_preProcessed: theStepPre,
        step_postProcessed: theStep
    })

    return promise.then(submitStepHandleSuccess, submitStepHandleError)
}

function submitStepHandleSuccess(response: any) {
    logQEvalActivity(false, {
        command: 'processLRV',
        data: response
    })

    if (response?.data === undefined || response.data.indexOf('network error') > -1) {
        return ({
            'status': 10,
            'text': 'The server is down',
            response: response
        })
    }

    let result = cleanResponse(response.data)

    let str, status

    let delimiter = '"',
        start = 1,
        tokens

    if (result.lastIndexOf('reProcessLRV') > -1) { // invalid step
        tokens = result.split(delimiter).slice(start)
        result = tokens[0]
        str = result
        status = 3
    } else if (result.lastIndexOf('processLRV') > -1) { // valid step
        tokens = result.split(delimiter).slice(start)
        result = tokens[0]
        if (result) {
            str = result
            status = 1
        } else {
            console.dir(result)
            str = (result ? result : 'This should not appear. See console for details. Please submit a comment and save the trace.')
            status = 10
        }
    } else if (result.lastIndexOf('getGrade') > -1) {
        tokens = result.split(delimiter).slice(start)
        result = tokens[0]
        str = result
        status = 0
    } else if (result.lastIndexOf('ShowGrade') > -1) {
        tokens = result.split(delimiter).slice(start)
        result = tokens[0]
        str = result
        status = -1
    } else {
        str = 'Critical Error: qEval returned an unexpected result - ' + response.data
        status = 10
    }

    return ({
        'status': status,
        'text': str,
        'response': response
    })
}

function submitStepHandleError(response: any) {
    logQEvalActivity(false, {
        command: 'processLRV',
        data: response
    })

    return ({
        'status': 10,
        'text': 'qEval took too long to respond. Please hold down alt/option and click the Evaluate Step button to send details to Querium engineering.',
        'response': response
    })
}

//---------------------------------------------------------------------
// GET HINT
//---------------------------------------------------------------------
export const getHint = function (qqKey: string, sessionCode: string) {
    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=getGeneralHints' + '&session=' + sessionCode + '&uuID=' + Math.floor(Math.random() * 100000)

    const promise: Promise<any> = axios.get(url)

    logQEvalActivity(true, {
        server: qEvalServer(),
        command: 'getGeneralHints',
        sessionCode: sessionCode,
        qqKey: qqKey,
        data: url
    })

    return (promise.then(getHintHandleSuccess, getHintHandleError))
}

function getHintHandleSuccess(response: any) {
    logQEvalActivity(false, {
        command: 'getGeneralHints',
        data: response
    })

    if (response?.data === undefined || response.data.indexOf('network error') > -1) {
        return ({
            'status': 10,
            'text': 'The server is down',
            response: response
        })
    }

    console.info('HINT RESPONSE FROM QEVAL')
    console.info(response)
    let result = cleanResponse(response.data)

    let delimiter = '"',
        start = 1,
        tokens = result.split(delimiter).slice(start)

    result = tokens[0].replace(/\\n/g, '\n').replace(/%5C/g, '\\').replace(/(<mo>)&#8744;(<\/mo>)/g, '<mspace width=\'.1em\'/>$1OR$2<mspace width=\'.1em\'/>')

    return ({
        'status': 4,
        'text': result,
        response: response
    })
}

function getHintHandleError(response: any) {
    logQEvalActivity(false, {
        command: 'getGeneralHints',
        data: response
    })

    console.info('>>> QEVAL GETGENERALHINT FAILURE >>>')
    console.info(response)

    return ({
        'status': 10,
        'text': 'The server is down',
        response: response
    })

}

//---------------------------------------------------------------------
// SHOW ME
//---------------------------------------------------------------------
export const showMe = function (qqKey: string, sessionCode: string) {
    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=showMe' + '&session=' + sessionCode

    const promise: Promise<any> = axios.get(url)

    logQEvalActivity(true, {
        server: qEvalServer(),
        command: 'showMe',
        sessionCode: sessionCode,
        qqKey: qqKey,
        data: url
    })

    return (promise.then(showMeHandleSuccess, showMeHandleError))
}

function showMeHandleSuccess(response: any) {
    logQEvalActivity(false, {
        command: 'showMe',
        data: response
    })

    if (response?.data === undefined || response.data.indexOf('network error') > -1) {
        return ({
            'status': 10,
            'text': 'The server is down',
            response: response
        })
    }

    let result = cleanResponse(response.data)
    let listStart, listEnd
    let instructions = [],
        list = [],
        step = []

    listStart = result.indexOf('List[') + 10
    listEnd = result.lastIndexOf(']')
    result = result.slice(listStart, listEnd)
    list = result.split('], List[')

    if (!result.length) { // if no results
        instructions.length = 0
    } else if (list.length) {
        // trim resulting strings
        for (var i = 0; i < list.length; i++) {
            step = list[i].split('", "')
            step[0] = step[0].replace(/(<mo>)&#8744;(<\/mo>)/g, '<mspace width=\'.1em\' />$1OR$2<mspace width=\'.1em\' />').replace(/%5C/g, '\\')
            step[1] = step[1].replace(/(<mo>)&#8744;(<\/mo>)/g, '<mspace width=\'.1em\' />$1OR$2<mspace width=\'.1em\' />').replace(/%5C/g, '\\')
            instructions[i] = {
                text: step[0].slice(1, step[0].length),
                details: step[1].slice(0, step[1].length - 1)
            }
        }
    } else { // no results returned
        instructions.length = 0
    }

    return ({
        'status': 4,
        'showMe': instructions,
        response: response
    })
}

function showMeHandleError(response: any) {
    logQEvalActivity(false, {
        command: 'showMe',
        data: response
    })

    console.info('>>> QEVAL SHOWME FAILURE >>>')
    console.info(response)

    return ({
        'status': 10,
        'text': 'The server is down',
        response: response
    })

}

//---------------------------------------------------------------------
// GET GRADE
//---------------------------------------------------------------------
export const getGrade = function (qqKey: string, sessionCode: string) {
    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=getGrade' + '&session=' + sessionCode

    const promise: Promise<any> = axios.get(url)
    return (promise.then(getGradeHandleSuccess, getGradeHandleError))
}

function getGradeHandleSuccess(response: any) {
    logQEvalActivity(false, {
        command: 'initializeSession',
        data: response
    })

    if (response?.data === undefined || response.data.indexOf('network error') > -1) {
        return ({
            'status': -1,
            'text': 'The server is down'
        })
    }

    var result = cleanResponse(response.data)

    var delimiter = '"',
        start = 1,
        tokens = result.split(delimiter).slice(start),
        result = tokens[0]

    return ({
        'status': 1,
        'grade': result
    })

}

function getGradeHandleError(response: any) {
    logQEvalActivity(false, {
        command: 'initializeSession',
        data: response
    })

    if (!response?.data || !(typeof response.data === 'object') || !response.data.message) {
        return ({
            'status': -1,
            'text': 'The server is down'
        })
    } // Otherwise, use expected error message.
    return response
}

//---------------------------------------------------------------------
// ASSESS SOLUTION
//---------------------------------------------------------------------
// TODO Jim - here is where I had not yet removed all the references to $q, so you will need to find out what other defer package can be used or refactor this
export const assessSolution = function (qqKey: string, sessionCode: string, theSteps: string) {
    if (!theSteps.length) {
        return
    }
    var deferredAssessment = $q.defer()
    var deferredPromise = deferredAssessment.promise

    deferredPromise
        .then(function () {
            console.log('in 1st then')
            var deferred = $q.defer()
            var promise = deferred.promise
            axios({
                method: 'GET',
                url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
            }).then(function (response) {
                console.log('in first resolve')
                deferred.resolve(response.data)
            })
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 2nd then' + prevResponse)
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in second resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 3rd then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 3rd resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 4th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 4th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 5th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 5th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 6th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 6th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 7th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 7th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 8th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 8th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 9th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 9th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in 10th then')
            var deferred = $q.defer()
            var promise = deferred.promise
            if (!theSteps.length) {
                deferred.resolve('That\'s all folks')
            } else {
                axios({
                    method: 'GET',
                    url: qEvalServer() + '?cmd=processLRV' + '&session=' + encodeURIComponent(sessionCode) + '&step=' + cleanMathML(theSteps.shift())
                }).then(function (response) {
                    console.log('in 10th resolve')
                    deferred.resolve(response.data)
                })
            }
            return promise
        })
        .then(function (prevResponse) {
            console.log('in final then')
            var deferred = $q.defer()
            var promise = deferred.promise
            axios({
                method: 'GET',
                url: qEvalServer() + '?cmd=getGrade' + '&session=' + sessionCode
            }).then(function (response) {
                console.log('in final resolve')

                var result = cleanResponse(response.data)
                var listStart, listEnd
                var analysis = [],
                    list = [],
                    step = []

                listStart = result.indexOf('List[') + 10
                listEnd = result.lastIndexOf(']')
                result = result.slice(listStart, listEnd)
                list = result.split('], List[')

                if (!result.length) { // if no results
                    analysis.length = 0
                } else if (list.length) {
                    // trim resulting strings
                    for (var i = 0; i < list.length; i++) {
                        step = list[i].split('", "')
                        analysis[i] = {
                            text: step[0].slice(1, step[0].length),
                            details: step[1].slice(0, step[1].length - 1)
                        }
                    }
                } else { // no results returned
                    analysis.length = 0
                }

                // TODO Jim - $rootScope, I assume, can be removed entirely. Was keeping it here in case I was wrong.
                $rootScope.$broadcast(
                    'ASSESSED', {
                        'status': 4,
                        'assessment': analysis
                    }
                )
                deferred.resolve(response.data)
            })
            return promise
        })

    deferredAssessment.resolve()
    $rootScope.$apply() // TODO Jim - same thing here
    return deferredPromise

}

//---------------------------------------------------------------------
// SUBMIT COMMENT
//---------------------------------------------------------------------
export const submitComment = function (qqKey: string, sessionCode: string, comment: string) {

    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=addComment' + '&session=' + sessionCode + '&comment=' +
        encodeURIComponent(comment.replace(/\+/g, '%2b').replace(/\&/g, '%26'))

    const promise: Promise<any> = axios.get(url)
    return (promise.then(submitCommentHandleSuccess, submitCommentHandleError))

    /*  keeping this until I've addded support on the server

                      var theParams, promise;
                      theParams = {
                          "math": 'applyState[addComment,{{' + sessionCode + ',' + sessionCode + '.state},{{Null,Null},Null,"' + comment + '"}}]'
                      };
                      promise = $http.post(qEvalServer, theParams);
                      return (promise.then(submitCommentHandleSuccess, submitCommentHandleError));

                      */
}

function submitCommentHandleSuccess(response: any) {
    if (response?.data === undefined) {
        return ({
            'status': 10,
            'text': 'The server is down'
        })
    }
    return (response)
}

function submitCommentHandleError(response: any) {
    return response
}

//---------------------------------------------------------------------
// SAVE TRACE
//---------------------------------------------------------------------
export const saveTrace = function (qqKey: string, sessionCode: string, comment: string) {
    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=saveTrace' +
        '&session=' + sessionCode + '&comment=' +
        encodeURIComponent(comment.replace(/\+/g, '%2b').replace(/\&/g, '%26'))

    const promise: Promise<any> = axios.get(url)
    return (promise.then(handlesaveTraceSuccess, handlesaveTraceError))
}

function handlesaveTraceSuccess(response: any) {
    if (response?.data === undefined) {
        return ({
            'status': 10,
            'text': 'The server is down'
        })
    }
    return response
}

function handlesaveTraceError(response: any) {
    return response
}

//---------------------------------------------------------------------
// PRECOMPUTE HINTS
//---------------------------------------------------------------------
export const precomputeHints = function (qqKey: string, sessionCode: string) {
    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=getGeneralHints' + '&preCompute=1' + '&session=' + sessionCode

    logQEvalActivity(true, {
        server: qEvalServer(),
        command: 'preComputeHints',
        sessionCode: sessionCode,
        qqKey: qqKey,
        data: url
    })

    const promise: Promise<any> = axios.get(url)
    return (promise.then(handlePrecomputeHintsSuccess, handlePrecomputeHintsError))

}

function handlePrecomputeHintsSuccess(response: any) {
    logQEvalActivity(false, {
        command: 'preComputeHints',
        data: response
    })

    if (response?.data === undefined || response.data.indexOf('network error') > -1) {
        return ({
            'status': 10,
            'text': 'The server is down'
        })
    }
    return true
}

function handlePrecomputeHintsError(response: any) {
    logQEvalActivity(false, {
        command: 'preComputeHints',
        data: response
    })

    console.error('Failed to preComputeHints')
    console.info(response)
    return false
}

//---------------------------------------------------------------------
// closeSession
//---------------------------------------------------------------------
export const closeSession = function (qqKey: string, sessionCode: string) {
    const url: string = qEvalServer() + '?appKey=' + qqKey + '&cmd=closeSession' + '&session=' + sessionCode
    axios.get(url)
}

//---------------------------------------------------------------------
// UTILITY FUNCTIONS
//---------------------------------------------------------------------

// clean up MathML for qEval
function cleanMathML(step: string) {
    const hasMathML = step.indexOf('MathML')
    if (hasMathML > -1) {
        step = step.replace('<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">', '<math>')
            .replace('<mstyle displaystyle="true">', '')
            .replace('</mstyle>', '')
            .replace(/(\r\n|\n|\r)/gm, '')
            .replace(/<mi>\sO\s<\/mi>\s*<mi>\sR\s<\/mi>/g, ' <mo> || </mo> ')
            .replace(/\s+/g, '')
            .replace('=', '&#63449;')
            .replace(/\+/g, '&#x2b;')
        console.log('MathML to be sent')
        console.log(step)
        step = encodeURIComponent(step)
    }
    return step
}

function cleanLaTeX(step: string) {
    const hasLaTeX: number = 1 // step.indexOf("\\");
    if (hasLaTeX > -1) {
        // step = step.replace(/\\times/g, '*')
        //     .replace(/(\\frac\{1\}\{2\})/g, '(1/2)')
        //     .replace(/(\\frac\{1\}\{4\})/g, '(1/4)')
        //     .replace(/(\*\w)/g, 'r')
        //     .replace(/(\*\*\*)/g, '^');
        //step = step.replace(/\s+/g, '').replace(/\+/g, '%252b');
        step = step.replace(/\s+/g, '').replace(/\+/g, '&#x2b;').replace('=', '&#63449;')
        //step = step.replace('=', '&#63449;');
        //step = step.replace(/\+/g, '&#x2b;');
        step = '\\begin{{equation}}' + step + '\\end{{equation}}'

        console.info('cleanLaTeX step', step)
        const URIstep: string = encodeURI(step)
        console.info('URIstep followed by URICstep')
        console.info(URIstep)

        const URICstep: string = encodeURIComponent(step)
        console.info(URICstep)

        step = URICstep
        console.log('decoded...')
        console.log(decodeURIComponent(step))
    }
    return step
}

// clean up webMMA response data
function cleanResponse(result: any) {
    // grab everything inside the <result> element
    var resultStart = result.indexOf('<result>') + 8
    var resultEnd = result.indexOf('</result>') - 8
    result = result.slice(resultStart, resultEnd)

    // TODO Jim - You'll probably want to escape this in a different way, as your new proxy service might not have access to a document
    // use invisible div to un-escape HTML characters
    let qqMathMLDiv = document.createElement('div') // moved this from module level scope
    qqMathMLDiv.innerHTML = result
    return qqMathMLDiv.textContent || qqMathMLDiv.innerText
}

// log qEval requests and responses
function logQEvalActivity(outgoing: boolean, data: any) {
    let loggedStudent;
    const sessionDetails = 'sessionDetails/'
    const sessions = 'sessions/'

    if (!qeLogging) {
        return
    }

    // TODO Jim - I commented all this out since I removed the firebase stuff. If you add firebase back you'll want to uncomment this.
    // let sessionID, sessionsRef, detailsRef, fullSessionID
    //
    // console.info('logQEvalActivity', data.command)
    // if (outgoing && data.command == 'initializeSession') {
    //     console.info('logQEvalActivity', data)
    //
    //     loggedStudent = data.student.toLowerCase().replace(/\@/g, 'AT').replace(/\./g, 'DOT')
    //     fullSessionID = data.sessionCode.replace(/\$/g, '|')
    //
    //     // kludge for caching sessionID contamination issue
    //     sessionID = fullSessionID.slice(0, fullSessionID.indexOf('|'))
    //     console.info('logQEvalActivity sessionID', sessionID)
    //
    //     sessionsRef = loggingDB.ref(sessions).push(fullSessionID)
    //     console.info('logQEvalActivity sessionsRef=', sessionsRef)
    //     detailsRef = loggingDB.ref(sessionDetails + fullSessionID)
    //     console.info('logQEvalActivity detailsRef=', detailsRef)
    //     detailsRef.push({
    //         buildDate: querium.buildDate,
    //         command: data.command + ' >>>',
    //         http: data.data,
    //         policy: data.policy,
    //         problemClass: data.problemClass,
    //         problemDef: data.problemDef,
    //         qqKey: data.qqKey,
    //         qs1: data.qs1,
    //         qs2: data.qs2,
    //         qs3: data.qs3,
    //         server: data.server,
    //         sessionCode: data.sessionCode,
    //         student: data.student,
    //         timestamp: Date.now()
    //     }).then((snap) => {
    //         const key = snap.key
    //         console.info('logQEvalActivity initializeSession push key', key)
    //     })
    //
    // } else if (outgoing && data.command == 'processLRV') {
    //     console.log('logQEvalActivity plain processLRV')
    //
    //     fullSessionID = data.sessionCode.replace(/\$/g, '|')
    //
    //     // kludge to for caching sessionID contamination issue
    //     sessionID = fullSessionID.slice(0, fullSessionID.indexOf('|'))
    //
    //     detailsRef = loggingDB.ref(sessionDetails + fullSessionID)
    //     detailsRef.push({
    //         command: data.command + ' >>>',
    //         http: data.data,
    //         qqKey: data.qqKey,
    //         step_preProcessed: data.step_preProcessed,
    //         step_postProcessed: data.step_postProcessed,
    //         server: data.server,
    //         sessionCode: data.sessionCode,
    //         student: loggedStudent,
    //         timestamp: Date.now()
    //     }).then((snap) => {
    //         const key = snap.key
    //         console.info('logQEvalActivity processLRV push key', key)
    //     })
    //
    // } else if (outgoing) {
    //     console.log('logQEvalActivity plain outgoing')
    //
    //     fullSessionID = data.sessionCode.replace(/\$/g, '|')
    //
    //     // kludge to for caching sessionID contamination issue
    //     sessionID = fullSessionID.slice(0, fullSessionID.indexOf('|'))
    //
    //     detailsRef = loggingDB.ref(sessionDetails + fullSessionID)
    //     console.log('logQEvalActivity other outgoing key', sessionDetails + fullSessionID)
    //     detailsRef.push({
    //         command: data.command + ' >>>',
    //         http: data.data,
    //         server: data.server,
    //         sessionCode: data.sessionCode,
    //         student: loggedStudent,
    //         timestamp: Date.now()
    //     }).then((snap) => {
    //         const key = snap.key
    //         console.info('logQEvalActivity other outgoing push key', key)
    //     })
    //
    // } else { // incoming response
    //     var retval = data.data.data
    //
    //     console.log('incoming response data', data)
    //     console.log('incoming response retval', retval)
    //     if (!retval) {
    //         var url = data.data.config.url
    //         var start = url.indexOf('session=') + 'session='.length
    //         var end = url.indexOf('&', start)
    //         end = (end == -1 ? url.length : end)
    //
    //         fullSessionID = url.substring(start, end).replace(/\%24/g, '|').replace(/\$/g, '|')
    //         sessionID = fullSessionID.slice(0, fullSessionID.indexOf('|'))
    //
    //         detailsRef = loggingDB.ref(sessionDetails + fullSessionID)
    //         console.log('logQEvalActivity incoming response no retval data key', sessionDetails + fullSessionID)
    //         console.log('incoming response noretval detailsRef', detailsRef)
    //         detailsRef.push({
    //             command: data.command + ' <<<',
    //             httpStatus: data.data.status,
    //             httpStatusText: data.data.statusText,
    //             response: retval || '',
    //             server: data.data.config.url,
    //             sessionCode: sessionID,
    //             student: loggedStudent,
    //             timestamp: Date.now()
    //         }).then((snap) => {
    //             const key = snap.key
    //             console.info('logQEvalActivity no retval push key', key)
    //         })
    //
    //     } else {
    //         fullSessionID = retval.substring(
    //             retval.indexOf('states/') + 7,
    //             retval.indexOf('.mx')
    //         ).replace(/\$/g, '|')
    //
    //         // kludge to for caching sessionID contamination issue
    //         sessionID = fullSessionID.slice(0, fullSessionID.indexOf('|'))
    //
    //         detailsRef = loggingDB.ref(sessionDetails + fullSessionID)
    //         console.log('logQEvalActivity incoming response retval data key', sessionDetails + fullSessionID)
    //         console.log('incoming response retval detailsRef', detailsRef)
    //         detailsRef.push({
    //             command: data.command + ' <<<',
    //             httpStatus: data.data.status,
    //             httpStatusText: data.data.statusText,
    //             response: retval,
    //             server: data.data.config.url,
    //             sessionCode: sessionID,
    //             student: loggedStudent,
    //             timestamp: Date.now()
    //         }).then((snap) => {
    //             const key = snap.key
    //             console.info('logQEvalActivity retval push key', key)
    //         })
    //     }
    // }
}

// generates a date stamp string for qEval internal logging
export const dateStamp = function () {
    // get timestamp
    const d: Date = new Date()

    // create datestamp for qEval logging
    let curr_date: number | string = d.getDate()
    curr_date = curr_date + ''
    if (curr_date.length == 1) {
        curr_date = '0' + curr_date
    }
    let curr_month: number | string = d.getMonth() + 1
    curr_month = curr_month + ''
    if (curr_month.length == 1) {
        curr_month = '0' + curr_month
    }
    const curr_year: number = d.getFullYear()
    let curr_hour: number | string = d.getHours()
    curr_hour = curr_hour + ''
    if (curr_hour.length == 1) {
        curr_hour = '0' + curr_hour
    }
    let curr_min: number | string = d.getMinutes()
    curr_min = curr_min + ''
    if (curr_min.length == 1) {
        curr_min = '0' + curr_min
    }
    let curr_sec: number | string = d.getSeconds()
    curr_sec = curr_sec + ''
    if (curr_sec.length == 1) {
        curr_sec = '0' + curr_sec
    }
    return '' + curr_date + curr_month + curr_year + curr_hour + curr_min + curr_sec
}

// discovers the identifiers (variables) in the problem
export const getIdentifiers = function (list: string) {
    const qEvalStyle: number = list.match(/List\[/g)?.length ?? 0
    let listStart, listEnd
    let identifiers: Array<string> = []

    if (qEvalStyle === 2) { // pre-July
        listStart = list.lastIndexOf('List[') + 5
        listEnd = list.indexOf(']', listStart)
        list = list.slice(listStart, listEnd)
        identifiers = list.split(',')
    } else { // new style with special operators
        // operators list
        const fourthListToken = list.lastIndexOf('List[')
        // identifiers list
        const thirdListToken = list.lastIndexOf('List[', fourthListToken - 1)
        listStart = thirdListToken + 5
        listEnd = list.lastIndexOf(']', fourthListToken)
        list = list.slice(listStart, listEnd)
        if (list.length) {
            identifiers = list.split(',')
        } else {
            identifiers = []
        }
    }

    // cleanup resulting strings
    for (let i = 0; i < identifiers.length; i++) {

        // strip extraneous quotes.  Because Wolfram forcibly converts any string
        // that looks like math (e.g., "cm^3") into a symbol, qEval has to wrap
        // these identifiers in quotes.
        identifiers[i] = identifiers[i].replace(/["]+/g, '')

        identifiers[i] = identifiers[i].trim()

        // convert MMA greek char encodings to UTF-8
        identifiers[i] = (identifiers[i] === '\\[Alpha]') ? 'α' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalAlpha]') ? 'Α' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Beta]') ? 'β' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalBeta]') ? 'Β' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Gamma]') ? 'γ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalGamma]') ? 'Γ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Delta]') ? 'δ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalDelta]') ? 'Δ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Epsilon]') ? 'ϵ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalEpsilon]') ? 'Ε' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Zeta]') ? 'ζ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalZeta]') ? 'Ζ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Eta]') ? 'η' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalEta]') ? 'Η' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Theta]') ? 'θ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalTheta]') ? 'Θ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Iota]') ? 'ι' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalIota]') ? 'Ι' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Kappa]') ? 'κ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalKappa]') ? 'Κ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Lambda]') ? 'λ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalLambda]') ? 'Λ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Mu]') ? 'μ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalMu]') ? 'Μ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Nu]') ? 'ν' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalNu]') ? 'Ν' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Xi]') ? 'ξ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalXi]') ? 'Ξ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Omicron]') ? 'ο' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalOmicron]') ? 'Ο' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Pi]') ? 'π' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalPi]') ? 'Π' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Rho]') ? 'ρ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalRho]') ? 'Ρ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Sigma]') ? 'σ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalSigma]') ? 'Σ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Tau]') ? 'τ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalTau]') ? 'Τ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Upsilon]') ? 'υ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalUpsilon]') ? 'Υ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Phi]') ? 'ϕ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalPhi]') ? 'Φ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Chi]') ? 'χ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalChi]') ? 'Χ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Psi]') ? 'ψ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalPsi]') ? 'Ψ' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[Omega]') ? 'ω' : identifiers[i]
        identifiers[i] = (identifiers[i] === '\\[CapitalOmega]') ? 'Ω' : identifiers[i]
    }

    for (let i = 0; i < identifiers.length; i++) {
        if (/^U\+/.test(identifiers[i])) {
            identifiers[i] = String.fromCharCode(parseInt('0x' + identifiers[i].substring(2, 10)))
        }
    }

    return identifiers
}

// discovers the special operators for the problem
export const getOperators = function (list: string) {
    const qEvalStyle: number = list.match(/List\[/g)?.length ?? 0
    let listStart, listEnd, nesting = 0
    let operators = []

    if (qEvalStyle === 2) { // pre-July
        return []
    } else {
        listStart = list.lastIndexOf('List[') + 5
        listEnd = listStart

        // find end of List[ block
        do {
            listEnd++
            if (list.charAt(listEnd) === '[') {
                nesting++
            } else if (list.charAt(listEnd) === ']') {
                nesting--
            }
        } while (listEnd < list.length && nesting > -1)

        list = list.slice(listStart, listEnd)
        operators = list.split(',')

        // trim resulting strings and convert Wolfram greek letters to UTF-8
        for (let i = 0; i < operators.length; i++) {
            operators[i] = operators[i].trim().replace(/['"]+/g, '')

            operators[i] = operators[i].replace('\\[Alpha]', 'α')
            operators[i] = operators[i].replace('\\[CapitalAlpha]', 'Α')
            operators[i] = operators[i].replace('\\[Beta]', 'β')
            operators[i] = operators[i].replace('\\[CapitalBeta]', 'Β')
            operators[i] = operators[i].replace('\\[Gamma]', 'γ')
            operators[i] = operators[i].replace('\\[CapitalGamma]', 'Γ')
            operators[i] = operators[i].replace('\\[Delta]', 'δ')
            operators[i] = operators[i].replace('\\[CapitalDelta]', 'Δ')
            operators[i] = operators[i].replace('\\[Epsilon]', 'ϵ')
            operators[i] = operators[i].replace('\\[CapitalEpsilon]', 'Ε')
            operators[i] = operators[i].replace('\\[Zeta]', 'ζ')
            operators[i] = operators[i].replace('\\[CapitalZeta]', 'Ζ')
            operators[i] = operators[i].replace('\\[Eta]', 'η')
            operators[i] = operators[i].replace('\\[CapitalEta]', 'Η')
            operators[i] = operators[i].replace('\\[Theta]', 'θ')
            operators[i] = operators[i].replace('\\[CapitalTheta]', 'Θ')
            operators[i] = operators[i].replace('\\[Iota]', 'ι')
            operators[i] = operators[i].replace('\\[CapitalIota]', 'Ι')
            operators[i] = operators[i].replace('\\[Kappa]', 'κ')
            operators[i] = operators[i].replace('\\[CapitalKappa]', 'Κ')
            operators[i] = operators[i].replace('\\[Lambda]', 'λ')
            operators[i] = operators[i].replace('\\[CapitalLambda]', 'Λ')
            operators[i] = operators[i].replace('\\[Mu]', 'μ')
            operators[i] = operators[i].replace('\\[CapitalMu]', 'Μ')
            operators[i] = operators[i].replace('\\[Nu]', 'ν')
            operators[i] = operators[i].replace('\\[CapitalNu]', 'Ν')
            operators[i] = operators[i].replace('\\[Xi]', 'ξ')
            operators[i] = operators[i].replace('\\[CapitalXi]', 'Ξ')
            operators[i] = operators[i].replace('\\[Omicron]', 'ο')
            operators[i] = operators[i].replace('\\[CapitalOmicron]', 'Ο')
            operators[i] = operators[i].replace('\\[Pi]', 'π')
            operators[i] = operators[i].replace('\\[CapitalPi]', 'Π')
            operators[i] = operators[i].replace('\\[Rho]', 'ρ')
            operators[i] = operators[i].replace('\\[CapitalRho]', 'Ρ')
            operators[i] = operators[i].replace('\\[Sigma]', 'σ')
            operators[i] = operators[i].replace('\\[CapitalSigma]', 'Σ')
            operators[i] = operators[i].replace('\\[Tau]', 'τ')
            operators[i] = operators[i].replace('\\[CapitalTau]', 'Τ')
            operators[i] = operators[i].replace('\\[Upsilon]', 'υ')
            operators[i] = operators[i].replace('\\[CapitalUpsilon]', 'Υ')
            operators[i] = operators[i].replace('\\[Phi]', 'ϕ')
            operators[i] = operators[i].replace('\\[CapitalPhi]', 'Φ')
            operators[i] = operators[i].replace('\\[Chi]', 'χ')
            operators[i] = operators[i].replace('\\[CapitalChi]', 'Χ')
            operators[i] = operators[i].replace('\\[Psi]', 'ψ')
            operators[i] = operators[i].replace('\\[CapitalPsi]', 'Ψ')
            operators[i] = operators[i].replace('\\[Omega]', 'ω')
            operators[i] = operators[i].replace('\\[CapitalOmega]', 'Ω')
        }
        return (operators[0].length ? operators : [])
    }
}

// provides high resolution current time
export const rightNow = function () {
    if (navigator.userAgent.indexOf('Safari') > -1) {
        var whatwhat = Date.now()
        return whatwhat
    } else {
        return performance.now()
    }
}

//---------------------------------------------------------------------
// ITEMS RETURNED HERE ARE AVAILABLE TO CONSUMERS OF THE SERVICE
//---------------------------------------------------------------------
// TODO Jim - I removed this as all public facing functions are now exported inline with their definition
