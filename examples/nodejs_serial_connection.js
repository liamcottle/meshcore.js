import NodeJSSerialConnection from "../src/connection/nodejs_serial_connection.js";

// create serial connection
const connection = new NodeJSSerialConnection("/dev/cu.usbmodem14401");

// wait until connected
connection.on("connected", async () => {

    // we are now connected
    console.log("Connected");

    // log contacts
    const contacts = await connection.getContacts();
    for(const contact of contacts) {
        console.log(`Contact: ${contact.advName}`);
    }

    // send message to public channel
    // await connection.sendChannelTextMessage(0, "test");

    // disconnect
    await connection.close();

});

// connect to meshcore device
await connection.connect();
