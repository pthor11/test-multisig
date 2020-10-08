import { tronWeb } from "./tronWeb"
import { factoryContractAddress, maxEventReturnSize } from "../config"
import { collectionNames, db } from "../mongo"

const getAllEvents = async (_fingerprint?: string, _events: any[] = []) => {
    try {
        const options: {
            onlyConfirmed: boolean,
            fingerprint?: string,
            size: number
        } = {
            onlyConfirmed: true,
            size: maxEventReturnSize
        }

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
        if (!refEvent) refEvent = await db.collection(collectionNames.events).findOne({}, { sort: { "raw.block": -1 }, limit: 1 })

        const options: {
            onlyConfirmed: boolean,
            fingerprint?: string,
            size: number
        } = {
            onlyConfirmed: true,
            size: maxEventReturnSize
        }

        if (_fingerprint) options.fingerprint = _fingerprint

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
        const count = await db.collection(collectionNames.events).estimatedDocumentCount()

        const events = count ? await updateEvents() : await getAllEvents()

        if (events.length > 0) {
            await db.collection(collectionNames.events).insertMany(events.map(event => {
                return {
                    processed: false,
                    raw: event,
                    createdAt: new Date()
                }
            }))

            console.log({ count, events: events.length })
        }

        setTimeout(syncEvents, 1000)
    } catch (e) {
        setTimeout(syncEvents, 1000)
        throw e
    }
}

export { syncEvents }