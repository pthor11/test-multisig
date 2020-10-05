import { signatureMinimum } from "./config"
import { UnWrap } from "./models/UnWrap"
import { collectionNames, db } from "./mongo"

const processUnWrap = async () => {
    try {
        const readyUnWrap: UnWrap | null = await db.collection(collectionNames.unwraps).findOne({
            processed: false,
            signeds: { $size: signatureMinimum }
        }, { sort: { createdAt: 1 } })

        console.log({ readyUnWrap })

        setTimeout(processUnWrap, 1000)
    } catch (e) {
        setTimeout(processUnWrap, 1000)
        throw e
    }
}

export { processUnWrap }