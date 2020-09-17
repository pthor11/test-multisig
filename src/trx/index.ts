import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()
    } catch (e) {
        throw e
    }
}

start()