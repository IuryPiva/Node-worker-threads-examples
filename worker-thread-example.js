const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const inquirer = require('inquirer')
const ora = require('ora')
// CALCULA QUANTAS THREADS TEM O PC DO USUÁRIO
const os = require('os')
const userCPUCount = os.cpus().length

// CALCULA O FATORIAL
const calculateFactorial = number => {
  if (number === 0) {
    return 1
  }
  return new Promise(async (resolve, reject) => {
    // CRIA UM ARRAY DE 0 ATÉ O NÚMERO
    const numbers = []
    for (let i = 1n; i <= number; i++) {
      numbers.push(i)
    }

    // CÁLCULA QUAL O TAMANHO DE CADA PEDAÇO QUE VAI SER EXECUTADO PARALELAMENTE
    const segmentSize = Math.ceil(numbers.length / userCPUCount)

    const segments = []

    // ARMAZENA CADA FATIA DE SEGMENTOS EM UM ARRAY
    for (let segmentIndex = 0; segmentIndex < userCPUCount; segmentIndex++) {
      const start = segmentIndex * segmentSize
      const end = start + segmentSize
      const segment = numbers.slice(start, end)
      segments.push(segment)
    }

    const results = await Promise.all(
      await segments.map(
        segment => 
          new Promise((workerResolve, workerReject) => {
            const worker = new Worker('./factorial-worker.js', {
              workerData: segment
            })
            worker.on('message', workerResolve)
            worker.on('error', workerReject)
            worker.on('exit', code => {
              if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`))
            })
          })
      )
    )

    const finalResult = results.reduce((previousValue, currentValue) => previousValue * currentValue, 1n)

    resolve(finalResult)
  })
}

const calculateFactorialLocal = (number) => {
  const numbers = []; 

  for (let i = 1n; i <= number; i++) {
    numbers.push(i)
  }

  return numbers.reduce((previousValue, currentValue) => previousValue * currentValue, 1n)
}
const run = async () => {
  while(1) {
    const {number} = await inquirer.prompt([
      {
        type: 'input',
        name: 'number',
        message: 'Calculate factorial for:',
        default: 10,
      },
    ])
  
    let label = 'multithread factorial'
    let spinner = ora(`Calculating with `).start()
    console.time(label)
    await calculateFactorial(BigInt(number))
    console.timeEnd(label)
    spinner.succeed(`Done!`)
    
    label = 'local factorial'
    spinner = ora(`Calculating with `).start()
    console.time(label)
    calculateFactorialLocal(BigInt(number))
    console.timeEnd(label)
    spinner.succeed(`Done!`)
  }
}

run()