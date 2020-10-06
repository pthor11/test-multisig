import { gql } from "apollo-server";

export const typeDefs = gql`

scalar Date
scalar JSON

type Query {
    hello: String
}
`