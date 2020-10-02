import { fork } from "child_process"
import { join } from "path"
const start = async () => {
    try {
        const btcProcess = fork(join(__dirname, `./btc/index`), [], { execArgv: ['-r', 'ts-node/register'] })
        const trxProcess = fork(join(__dirname, `./trx/index`), [], { execArgv: ['-r', 'ts-node/register'] })

        btcProcess.on('error', e => { throw { btc: e } })
        trxProcess.on('error', e => { throw { trx: e } })

        btcProcess.on('message', msg => trxProcess.send(msg)) // passing msg from btc process to trx process
        trxProcess.on('message', msg => btcProcess.send(msg)) // passing msg from trx process to btc process
    } catch (e) {
        throw e
    }
}

start()