import { tronWeb } from "./tronWeb"

const contractAddress = ''

const wrap = async (tx: string, amount: number, address: string) => {
    try {
        const contract = await tronWeb.contract().at(contractAddress)

        // console.log({ contract });

        const result = await contract.custodianConfirm('0x' + tx, amount, address).send({ callValue: 0 })

        console.log({ result })

    } catch (e) {
        throw e
    }
}

// wrap('f5931122aa7449c3b3b182fec18b75ab1bfda917c1541603debb3afab3a9cdc7', 100, 'TSWVGDF84HNQgxV1JNcnqLytvmzzD8ioES').then(console.log).catch(console.error)

const checkUnwrapEventFromBlock = async (blockNumber?: number) => {
    try {
        const results = await tronWeb.getEventResult(contractAddress, { eventName: 'UnWrap', /* blockNumber, */  /* size: 1, */ onlyConfirmed: true, /*  fingerprint: 'tKBOrO42HixNjw5' */})
        for (const result of results) {
            console.log(result);
            
        }

    } catch (e) {
        throw e
    }
}

checkUnwrapEventFromBlock(8067107)

// /* const getEventResultFromContractAddress =  */tronWeb.getEventResult(contractAddress, { eventName: 'UnWrap', blockNumber: 8067107 }, (err, data) => console.log({ err, data }))

// getEventResultFromContractAddress()