import { port } from "./config";
import { connectDb } from "./mongo";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs/schema";
import { ApolloServer } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { ApolloServerPluginInlineTraceDisabled } from "apollo-server-core";

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

        console.log(`🚀 wrapper-api ready at ${url}`);
    } catch (e) {
        throw e
    }
}

start()