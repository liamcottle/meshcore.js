import BufferWriter from "../buffer_writer.js";
import BufferReader from "../buffer_reader.js";
import Constants from "../constants.js";
import EventEmitter from "../events.js";

class Connection extends EventEmitter {

    async close() {
        throw new Error("This method must be implemented by the subclass.");
    }

    async sendToRadioFrame(data) {
        throw new Error("This method must be implemented by the subclass.");
    }

    async sendCommandAppStart() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.AppStart);
        data.writeByte(1); // appVer
        data.writeBytes(new Uint8Array(6)); // reserved
        data.writeString("test"); // appName
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendTxtMsg(txtType, attempt, senderTimestamp, pubKeyPrefix, text) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendTxtMsg);
        data.writeByte(txtType);
        data.writeByte(attempt);
        data.writeUInt32LE(senderTimestamp);
        data.writeBytes(pubKeyPrefix.slice(0, 6)); // only the first 6 bytes of pubKey are sent
        data.writeString(text);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetContacts(since) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetContacts);
        if(since){
            data.writeUInt32LE(since);
        }
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetDeviceTime() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetDeviceTime);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetDeviceTime(epochSecs) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetDeviceTime);
        data.writeUInt32LE(epochSecs);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendSelfAdvert(type) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendSelfAdvert);
        data.writeByte(type);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetAdvertName(name) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetAdvertName);
        data.writeString(name);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandAddUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.AddUpdateContact);
        data.writeBytes(publicKey);
        data.writeByte(type);
        data.writeByte(flags);
        data.writeByte(outPathLen);
        data.writeBytes(outPath); // 64 bytes
        data.writeCString(advName, 32); // 32 bytes
        data.writeUInt32LE(lastAdvert);
        data.writeUInt32LE(advLat);
        data.writeUInt32LE(advLon);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSyncNextMessage() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SyncNextMessage);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetRadioParams(radioFreq, radioBw, radioSf, radioCr) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetRadioParams);
        data.writeUInt32LE(radioFreq);
        data.writeUInt32LE(radioBw);
        data.writeByte(radioSf);
        data.writeByte(radioCr);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetTxPower(txPower) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetTxPower);
        data.writeByte(txPower);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandResetPath(pubKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ResetPath);
        data.writeBytes(pubKey); // 32 bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSetAdvertLatLon(lat, lon) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SetAdvertLatLon);
        data.writeInt32LE(lat);
        data.writeInt32LE(lon);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandRemoveContact(pubKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.RemoveContact);
        data.writeBytes(pubKey); // 32 bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    onFrameReceived(frame) {

        // emit received frame
        this.emit("rx", frame);

        const bufferReader = new BufferReader(frame);
        const responseCode = bufferReader.readByte();

        if(responseCode === Constants.ResponseCodes.SelfInfo){
            this.onSelfInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.CurrTime){
            this.onCurrTimeResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.NoMoreMessages){
            this.onNoMoreMessagesResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactMsgRecv){
            this.onContactMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactsStart){
            this.onContactsStartResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Contact){
            this.onContactResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.EndOfContacts){
            this.onEndOfContactsResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Sent){
            this.onSentResponse(bufferReader);
        } else if(responseCode === Constants.PushCodes.Advert){
            this.onAdvertPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.SendConfirmed){
            this.onSendConfirmedPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.MsgWaiting){
            this.onMsgWaitingPush(bufferReader);
        } else {
            console.log("unhandled frame", frame);
        }

    }

    onAdvertPush(bufferReader) {
        this.emit("AdvertPush", {
            publicKey: bufferReader.readBytes(32),
        });
    }

    onSendConfirmedPush(bufferReader) {
        this.emit("SendConfirmedPush", {
            ackCode: bufferReader.readBytes(4),
            roundTrip: bufferReader.readUInt32LE(),
        });
    }

    onMsgWaitingPush(bufferReader) {
        this.emit("MsgWaitingPush", {

        });
    }

    onContactsStartResponse(bufferReader) {
        this.emit("ContactsStartResponse", {
            count: bufferReader.readUInt32LE(),
        });
    }

    onContactResponse(bufferReader) {
        this.emit("ContactResponse", {
            publicKey: bufferReader.readBytes(32),
            type: bufferReader.readByte(),
            flags: bufferReader.readByte(),
            outPathLen: bufferReader.readByte(),
            outPath: bufferReader.readBytes(64),
            advName: bufferReader.readCString(32),
            lastAdvert: bufferReader.readUInt32LE(),
            advLat: bufferReader.readUInt32LE(),
            advLon: bufferReader.readUInt32LE(),
            lastMod: bufferReader.readUInt32LE(),
        });
    }

    onEndOfContactsResponse(bufferReader) {
        this.emit("EndOfContactsResponse", {
            mostRecentLastmod: bufferReader.readUInt32LE(),
        });
    }

    onSentResponse(bufferReader) {
        this.emit("SentResponse", {

        });
    }

    onSelfInfoResponse(bufferReader) {
        this.emit("SelfInfoResponse", {
            type: bufferReader.readByte(),
            txPower: bufferReader.readByte(),
            maxTxPower: bufferReader.readByte(),
            publicKey: bufferReader.readBytes(32),
            advLat: bufferReader.readInt32LE(),
            advLon: bufferReader.readInt32LE(),
            reserved: bufferReader.readBytes(4),
            radioFreq: bufferReader.readUInt32LE(),
            radioBw: bufferReader.readUInt32LE(),
            radioSf: bufferReader.readByte(),
            radioCr: bufferReader.readByte(),
            name: bufferReader.readString(),
        });
    }

    onCurrTimeResponse(bufferReader) {
        this.emit("CurrTimeResponse", {
            epochSecs: bufferReader.readUInt32LE(),
        });
    }

    onNoMoreMessagesResponse(bufferReader) {
        this.emit("NoMoreMessagesResponse", {

        });
    }

    onContactMsgRecvResponse(bufferReader) {
        this.emit("ContactMsgRecvResponse", {
            pubKeyPrefix: bufferReader.readBytes(6),
            pathLen: bufferReader.readByte(),
            txtType: bufferReader.readByte(),
            senderTimestamp: bufferReader.readUInt32LE(),
            text: bufferReader.readString(),
        });
    }

}

export default Connection;
