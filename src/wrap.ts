import { tronWeb } from "./tronWeb"

const contractAddress = 'TRrtM9n8BYeSR2PK4JbcrUuEAmPd4hWhc8'

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

// wrap('36425fb781a9ea5df1cda0deff27574ebf892849b4f3b9f8dbbbd61b6c1ac788', 400, 'TSWVGDF84HNQgxV1JNcnqLytvmzzD8ioES').then(console.log).catch(console.error)