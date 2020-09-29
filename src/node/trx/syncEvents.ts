import { tronWeb } from "./tronWeb"
import { factoryContractAddress } from "../config"
import { collectionNames, connectDb, db } from "../mongo"

const getAllEvents = async (_fingerprint?: string, _events: any[] = []) => {
    try {
        const options: {
            fingerprint?: string,
            size: number
        } = { size: 1 }

        if (_fingerprint) options.fingerprint = _fingerprint

        const events: any[] = await tronWeb.getEventResult(factoryContractAddress, options)

        const fingerprint = events[events.length - 1]?.fingerprint

        return fingerprint ? getAllEvents(fingerprint, [..._events, ...events]) : [..._events, ...events]

    } catch (e) {
        throw e
    }
}

const updateEvents = async (_fingerprint?: string, _events: any[] = [], refEvent?: any) => {
    try {
        if (!refEvent) refEvent = await db.collection(collectionNames.trxEvents).findOne({}, { sort: { "raw.block": -1 }, limit: 1 })

        const options: {
            fingerprint?: string,
            size: number
        } = { size: 1 }

        if (_fingerprint) options.fingerprint = _fingerprint

        // console.log({ _fingerprint, refEvent })


        const events: any[] = await tronWeb.getEventResult(factoryContractAddress, options)

        if (events.find(event => event.transaction === refEvent.raw.transaction)) return events.filter(event => event.block > refEvent.raw.block)

        const fingerprint = events[events.length - 1]?.fingerprint

        return fingerprint ? updateEvents(fingerprint, [..._events, ...events], refEvent) : [..._events, ...events]
    } catch (e) {
        throw e
    }
}

const syncEvents = async () => {
    try {
        const count = await db.collection(collectionNames.trxEvents).estimatedDocumentCount()

        const events = count ? await updateEvents() : await getAllEvents()

        // console.log({ count, events: events.length })

        if (events.length > 0) await db.collection(collectionNames.trxEvents).insertMany(events.map(event => {
            return {
                processed: false,
                raw: event,
                createdAt: new Date()
            }
        }))

        setTimeout(syncEvents, 1000)
    } catch (e) {
        setTimeout(syncEvents, 1000)
        throw e
    }
}

export { syncEvents }