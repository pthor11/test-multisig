import TronWeb from 'tronweb'
import { fullHost } from "./config";

const tronweb = new TronWeb({ fullHost })

export { tronweb }