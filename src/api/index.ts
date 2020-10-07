import { port } from "./config";
import { connectDb } from "./mongo";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs/schema";
import { ApolloServer } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ApolloServerPluginInlineTraceDisabled } from "apollo-server-core";
import { syncTxs } from "./syncTxs";
import { syncEvents } from "./syncEvents";

const start = async () => {
    try {
        await connectDb()

        const server = new ApolloServer({
            schema: buildFederatedSchema([{
                typeDefs,
                resolvers
            }]),
            plugins: [ApolloServerPluginInlineTraceDisabled()],
            context: req => req
        })

        const { url } = await server.listen({ port })

        console.log(`🚀 wrapper-api ready at ${url}`)

        await Promise.all([
            syncTxs(),
            syncEvents()
        ])

    } catch (e) {
        throw e
    }
}

start()