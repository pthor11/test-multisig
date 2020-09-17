import { checkUnwrapEvents } from "./custodian"
import { connectDb } from "./mongo"

const start = async() => {
    try {
        await connectDb()

        await checkUnwrapEvents()
    } catch (e) {
        throw e
    }
}

start()