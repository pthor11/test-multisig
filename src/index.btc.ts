import { connectDb } from "./mongo"

const start = async() => {
    try {

        await connectDb()
        
        const hello = () => {
            console.log('btc')
            setTimeout(hello, 1000)
        }

        hello()
    } catch (e) {
        throw e
    }
}

start()