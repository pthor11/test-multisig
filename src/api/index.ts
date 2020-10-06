import { port } from "./config";
import { connectDb} from "./mongo";
import { ApolloServer } from "apollo-server";
import { buildFederatedSchema } from "@apollo/federation";
import { typeDefs } from "./typeDefs/schema";
import { resolvers } from "./resolvers";

const start = async () => {
    try {
        await connectDb()

        const server = new ApolloServer({
            schema: buildFederatedSchema([{
                typeDefs,
                resolvers
            }]),
            context: req => req
        })

        const { url } = await server.listen({ port })

        console.log(`🚀 wrapper-api ready at ${url}`);
    } catch (e) {
        throw e
    }
}

start()