import TCPConnection from "../src/connection/tcp_connection.js";
import Constants from "../src/constants.js";

// create tcp connection
const connection = new TCPConnection("10.1.0.226", 5000);

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log(`Connected to: [${connection.host}:${connection.port}]`);

    // send flood advert when connected
    await connection.sendFloodAdvert();

});

// listen for new messages
connection.on(Constants.PushCodes.MsgWaiting, async () => {
    try {
        const waitingMessages = await connection.getWaitingMessages();
        for(const message of waitingMessages){
            if(message.contactMessage){
                await onContactMessageReceived(message.contactMessage);
            } else if(message.channelMessage) {
                await onChannelMessageReceived(message.channelMessage);
            }
        }
    } catch(e) {
        console.log(e);
    }
});

async function onContactMessageReceived(message) {

    console.log("Received contact message", message);

    // find first contact matching pub key prefix
    const contact = await connection.findContactByPublicKeyPrefix(message.pubKeyPrefix);
    if(!contact){
        console.log("Did not find contact for received message");
        return;
    }

    // send it back
    await connection.sendTextMessage(contact.publicKey, message.text, Constants.TxtTypes.Plain);

}

async function onChannelMessageReceived(message) {
    console.log(`Received channel message`, message);
}

// todo auto reconnect on disconnect

// connect to meshcore device
await connection.connect();
