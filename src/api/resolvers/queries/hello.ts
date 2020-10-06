export const hello = async (root: any, args, ctx: any, info: any) => {
    try {
        
        return 'world'
    } catch (e) {
        throw e
    }
}