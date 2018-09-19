const { Worker, parentPort, workerData } = require('worker_threads')

const numbers = workerData

const calculateFactorial = numArray => numArray.reduce((previousValue, currentValue) => previousValue * currentValue, 1n)

const result = calculateFactorial(numbers)

parentPort.postMessage(result)