import BufferWriter from "../buffer_writer.js";
import BufferReader from "../buffer_reader.js";
import Constants from "../constants.js";
import EventEmitter from "../events.js";
import BufferUtils from "../buffer_utils.js";

class Connection extends EventEmitter {

    onConnected() {
        this.emit("connected");
    }

    onDisconnected() {
        this.emit("disconnected");
    }

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

    async sendCommandSendChannelTxtMsg(txtType, channelIdx, senderTimestamp, text) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendChannelTxtMsg);
        data.writeByte(txtType);
        data.writeByte(channelIdx);
        data.writeUInt32LE(senderTimestamp);
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
        data.writeByte(outPathLen); // todo writeInt8
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

    async sendCommandShareContact(pubKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ShareContact);
        data.writeBytes(pubKey); // 32 bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    // provide a public key to export that contact
    // not providing a public key will export local identity as a contact instead
    async sendCommandExportContact(pubKey = null) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ExportContact);
        if(pubKey){
            data.writeBytes(pubKey); // 32 bytes
        }
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandImportContact(advertPacketBytes) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ImportContact);
        data.writeBytes(advertPacketBytes); // raw advert packet bytes
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandReboot() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.Reboot);
        data.writeString("reboot");
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandGetBatteryVoltage() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.GetBatteryVoltage);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandDeviceQuery(appTargetVer) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.DeviceQuery);
        data.writeByte(appTargetVer); // e.g: 1
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandExportPrivateKey() {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ExportPrivateKey);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandImportPrivateKey(privateKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.ImportPrivateKey);
        data.writeBytes(privateKey);
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendLogin(publicKey, password) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendLogin);
        data.writeBytes(publicKey); // 32 bytes - id of repeater or room server
        data.writeString(password); // password is remainder of frame, max 15 characters
        await this.sendToRadioFrame(data.toBytes());
    }

    async sendCommandSendStatusReq(publicKey) {
        const data = new BufferWriter();
        data.writeByte(Constants.CommandCodes.SendStatusReq);
        data.writeBytes(publicKey); // 32 bytes - id of repeater or room server
        await this.sendToRadioFrame(data.toBytes());
    }

    onFrameReceived(frame) {

        // emit received frame
        this.emit("rx", frame);

        const bufferReader = new BufferReader(frame);
        const responseCode = bufferReader.readByte();

        if(responseCode === Constants.ResponseCodes.Ok){
            this.onOkResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Err){
            this.onErrResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.SelfInfo){
            this.onSelfInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.CurrTime){
            this.onCurrTimeResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.NoMoreMessages){
            this.onNoMoreMessagesResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactMsgRecv){
            this.onContactMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ChannelMsgRecv){
            this.onChannelMsgRecvResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ContactsStart){
            this.onContactsStartResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Contact){
            this.onContactResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.EndOfContacts){
            this.onEndOfContactsResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Sent){
            this.onSentResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.ExportContact){
            this.onExportContactResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.BatteryVoltage){
            this.onBatteryVoltageResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.DeviceInfo){
            this.onDeviceInfoResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.PrivateKey){
            this.onPrivateKeyResponse(bufferReader);
        } else if(responseCode === Constants.ResponseCodes.Disabled){
            this.onDisabledResponse(bufferReader);
        } else if(responseCode === Constants.PushCodes.Advert){
            this.onAdvertPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.PathUpdated){
            this.onPathUpdatedPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.SendConfirmed){
            this.onSendConfirmedPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.MsgWaiting){
            this.onMsgWaitingPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.LoginSuccess){
            this.onLoginSuccessPush(bufferReader);
        } else if(responseCode === Constants.PushCodes.StatusResponse){
            this.onStatusResponsePush(bufferReader);
        } else {
            console.log("unhandled frame", frame);
        }

    }

    onAdvertPush(bufferReader) {
        this.emit(Constants.PushCodes.Advert, {
            publicKey: bufferReader.readBytes(32),
        });
    }

    onPathUpdatedPush(bufferReader) {
        this.emit(Constants.PushCodes.PathUpdated, {
            publicKey: bufferReader.readBytes(32),
        });
    }

    onSendConfirmedPush(bufferReader) {
        this.emit(Constants.PushCodes.SendConfirmed, {
            ackCode: bufferReader.readUInt32LE(),
            roundTrip: bufferReader.readUInt32LE(),
        });
    }

    onMsgWaitingPush(bufferReader) {
        this.emit(Constants.PushCodes.MsgWaiting, {

        });
    }

    onLoginSuccessPush(bufferReader) {
        this.emit(Constants.PushCodes.LoginSuccess, {
            reserved: bufferReader.readByte(), // reserved
            pubKeyPrefix: bufferReader.readBytes(6), // 6 bytes of public key this login success is from
        });
    }

    onStatusResponsePush(bufferReader) {
        this.emit(Constants.PushCodes.StatusResponse, {
            reserved: bufferReader.readByte(), // reserved
            pubKeyPrefix: bufferReader.readBytes(6), // 6 bytes of public key this status response is from
            statusData: bufferReader.readRemainingBytes(),
        });
    }

    onOkResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Ok, {

        });
    }

    onErrResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Err, {

        });
    }

    onContactsStartResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.ContactsStart, {
            count: bufferReader.readUInt32LE(),
        });
    }

    onContactResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Contact, {
            publicKey: bufferReader.readBytes(32),
            type: bufferReader.readByte(),
            flags: bufferReader.readByte(),
            outPathLen: bufferReader.readInt8(),
            outPath: bufferReader.readBytes(64),
            advName: bufferReader.readCString(32),
            lastAdvert: bufferReader.readUInt32LE(),
            advLat: bufferReader.readUInt32LE(),
            advLon: bufferReader.readUInt32LE(),
            lastMod: bufferReader.readUInt32LE(),
        });
    }

    onEndOfContactsResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.EndOfContacts, {
            mostRecentLastmod: bufferReader.readUInt32LE(),
        });
    }

    onSentResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Sent, {
            result: bufferReader.readInt8(),
            expectedAckCrc: bufferReader.readUInt32LE(),
            estTimeout: bufferReader.readUInt32LE(),
        });
    }

    onExportContactResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.ExportContact, {
            advertPacketBytes: bufferReader.readRemainingBytes(),
        });
    }

    onBatteryVoltageResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.BatteryVoltage, {
            batteryMilliVolts: bufferReader.readUInt16LE(),
        });
    }

    onDeviceInfoResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.DeviceInfo, {
            firmwareVer: bufferReader.readInt8(),
            reserved: bufferReader.readBytes(6), // reserved
            firmware_build_date: bufferReader.readCString(12), // eg. "19 Feb 2025"
            manufacturerModel: bufferReader.readString(), // remainder of frame
        });
    }

    onPrivateKeyResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.PrivateKey, {
            privateKey: bufferReader.readBytes(64),
        });
    }

    onDisabledResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.Disabled, {

        });
    }

    onSelfInfoResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.SelfInfo, {
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
        this.emit(Constants.ResponseCodes.CurrTime, {
            epochSecs: bufferReader.readUInt32LE(),
        });
    }

    onNoMoreMessagesResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.NoMoreMessages, {

        });
    }

    onContactMsgRecvResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.ContactMsgRecv, {
            pubKeyPrefix: bufferReader.readBytes(6),
            pathLen: bufferReader.readByte(),
            txtType: bufferReader.readByte(),
            senderTimestamp: bufferReader.readUInt32LE(),
            text: bufferReader.readString(),
        });
    }

    onChannelMsgRecvResponse(bufferReader) {
        this.emit(Constants.ResponseCodes.ChannelMsgRecv, {
            channelIdx: bufferReader.readInt8(), // reserved (0 for now, ie. 'public')
            pathLen: bufferReader.readByte(), // 0xFF if was sent direct, otherwise hop count for flood-mode
            txtType: bufferReader.readByte(),
            senderTimestamp: bufferReader.readUInt32LE(),
            text: bufferReader.readString(),
        });
    }

    getSelfInfo(timeoutMillis = null) {
        return new Promise(async (resolve, reject) => {

            // listen for response
            this.once(Constants.ResponseCodes.SelfInfo, (selfInfo) => {
                resolve(selfInfo);
            });

            // timeout after provided milliseconds if device did not respond
            if(timeoutMillis != null){
                setTimeout(reject, timeoutMillis);
            }

            // request self info
            await this.sendCommandAppStart();

        });
    }

    async sendAdvert(type) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // send advert
                await this.sendCommandSendSelfAdvert(type);

            } catch(e) {
                reject(e);
            }
        });
    }

    async sendFloodAdvert() {
        return await this.sendAdvert(Constants.SelfAdvertTypes.Flood);
    }

    async sendZeroHopAdvert() {
        return await this.sendAdvert(Constants.SelfAdvertTypes.ZeroHop);
    }

    setAdvertName(name) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set advert name
                await this.sendCommandSetAdvertName(name);

            } catch(e) {
                reject(e);
            }
        });
    }

    setAdvertLatLong(latitude, longitude) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set advert lat lon
                await this.sendCommandSetAdvertLatLon(latitude, longitude);

            } catch(e) {
                reject(e);
            }
        });
    }

    setTxPower(txPower) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set tx power
                await this.sendCommandSetTxPower(txPower);

            } catch(e) {
                reject(e);
            }
        });
    }

    setRadioParams(radioFreq, radioBw, radioSf, radioCr) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set tx power
                await this.sendCommandSetRadioParams(radioFreq, radioBw, radioSf, radioCr);

            } catch(e) {
                reject(e);
            }
        });
    }

    getContacts() {
        return new Promise(async (resolve, reject) => {

            // add contacts we receive to a list
            const contacts = [];
            const onContactReceived = (contact) => {
                contacts.push(contact);
            }

            // listen for contacts
            this.on(Constants.ResponseCodes.Contact, onContactReceived);

            // there's no more contacts to receive, stop listening and resolve the promise
            this.once(Constants.ResponseCodes.EndOfContacts, () => {
                this.off(Constants.ResponseCodes.Contact, onContactReceived);
                resolve(contacts);
            });

            // request contacts from device
            await this.sendCommandGetContacts();

        });
    }

    async findContactByPublicKeyPrefix(pubKeyPrefix) {

        // get contacts
        const contacts = await this.getContacts();

        // find first contact matching pub key prefix
        return contacts.find((contact) => {
            const contactPubKeyPrefix = contact.publicKey.subarray(0, pubKeyPrefix.length);
            return BufferUtils.areBuffersEqual(pubKeyPrefix, contactPubKeyPrefix);
        });

    }

    sendTextMessage(contactPublicKey, text, type) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive sent response
                const onSent = (response) => {
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.ResponseCodes.Err, onErr);

                // compose message
                const txtType = type ?? Constants.TxtTypes.Plain;
                const attempt = 0;
                const senderTimestamp = Math.floor(Date.now() / 1000);

                // send message
                await this.sendCommandSendTxtMsg(txtType, attempt, senderTimestamp, contactPublicKey, text);

            } catch(e) {
                reject(e);
            }
        });
    }

    sendChannelTextMessage(channelIdx, text) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // compose message
                const txtType = Constants.TxtTypes.Plain;
                const senderTimestamp = Math.floor(Date.now() / 1000);

                // send message
                await this.sendCommandSendChannelTxtMsg(txtType, channelIdx, senderTimestamp, text);

            } catch(e) {
                reject(e);
            }
        });
    }

    syncNextMessage() {
        return new Promise(async (resolve, reject) => {

            // resolve promise when we receive a contact message
            const onContactMessageReceived = (message) => {
                this.off(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);
                resolve({
                    contactMessage: message,
                });
            }

            // resolve promise when we receive a channel message
            const onChannelMessageReceived = (message) => {
                this.off(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);
                resolve({
                    channelMessage: message,
                });
            }

            // resolve promise when we have no more messages to receive
            const onNoMoreMessagesReceived = () => {
                this.off(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
                this.off(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
                this.off(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);
                resolve(null);
            }

            // listen for events
            this.once(Constants.ResponseCodes.ContactMsgRecv, onContactMessageReceived);
            this.once(Constants.ResponseCodes.ChannelMsgRecv, onChannelMessageReceived);
            this.once(Constants.ResponseCodes.NoMoreMessages, onNoMoreMessagesReceived);

            // sync next message from device
            await this.sendCommandSyncNextMessage();

        });
    }

    async getWaitingMessages() {

        const waitingMessages = [];

        while(true){

            // get next message, otherwise stop if nothing is returned
            const message = await this.syncNextMessage();
            if(!message){
                break;
            }

            // add to waiting messages list
            waitingMessages.push(message);

        }

        return waitingMessages;

    }

    getDeviceTime() {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive sent response
                const onCurrTime = (response) => {
                    this.off(Constants.ResponseCodes.CurrTime, onCurrTime);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.CurrTime, onCurrTime);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.CurrTime, onCurrTime);
                this.once(Constants.ResponseCodes.Err, onErr);

                // get device time
                await this.sendCommandGetDeviceTime();

            } catch(e) {
                reject(e);
            }
        });
    }

    setDeviceTime(epochSecs) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // set device time
                await this.sendCommandSetDeviceTime(epochSecs);

            } catch(e) {
                reject(e);
            }
        });
    }

    importContact(advertPacketBytes) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // import contact
                await this.sendCommandImportContact(advertPacketBytes);

            } catch(e) {
                reject(e);
            }
        });
    }

    exportContact(pubKey = null) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive export contact response
                const onExportContact = (response) => {
                    this.off(Constants.ResponseCodes.ExportContact, onExportContact);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.ExportContact, onExportContact);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.ExportContact, onExportContact);
                this.once(Constants.ResponseCodes.Err, onErr);

                // export contact
                await this.sendCommandExportContact(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    shareContact(pubKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // share contact
                await this.sendCommandShareContact(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    removeContact(pubKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // remove contact
                await this.sendCommandRemoveContact(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    addOrUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // add or update contact
                await this.sendCommandAddUpdateContact(publicKey, type, flags, outPathLen, outPath, advName, lastAdvert, advLat, advLon);

            } catch(e) {
                reject(e);
            }
        });
    }

    setContactPath(contact, path) {
        return new Promise(async (resolve, reject) => {
            try {

                // create empty out path
                const maxPathLength = 64;
                const outPath = new Uint8Array(maxPathLength);

                // fill out path with the provided path
                for(var i = 0; i < path.length && i < maxPathLength; i++){
                    outPath[i] = path[i];
                }

                // update contact details with new path and path length
                contact.outPathLen = path.length;
                contact.outPath = outPath;

                // update contact
                return await this.addOrUpdateContact(contact.publicKey, contact.type, contact.flags, contact.outPathLen, contact.outPath, contact.advName, contact.lastAdvert, contact.advLat, contact.advLon);

            } catch(e) {
                reject(e);
            }
        });
    }

    resetPath(pubKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);

                // reset path
                await this.sendCommandResetPath(pubKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    reboot() {
        return new Promise(async (resolve, reject) => {
            try {

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // assume device rebooted after a short delay
                setTimeout(() => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve();
                }, 1000);

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);

                // reboot
                await this.sendCommandReboot();

            } catch(e) {
                reject(e);
            }
        });
    }

    getBatteryVoltage() {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive battery voltage
                const onBatteryVoltage = (response) => {
                    this.off(Constants.ResponseCodes.BatteryVoltage, onBatteryVoltage);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.BatteryVoltage, onBatteryVoltage);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.BatteryVoltage, onBatteryVoltage);
                this.once(Constants.ResponseCodes.Err, onErr);

                // get battery voltage
                await this.sendCommandGetBatteryVoltage();

            } catch(e) {
                reject(e);
            }
        });
    }

    deviceQuery(appTargetVer) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive device info
                const onDeviceInfo = (response) => {
                    this.off(Constants.ResponseCodes.DeviceInfo, onDeviceInfo);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.DeviceInfo, onDeviceInfo);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.DeviceInfo, onDeviceInfo);
                this.once(Constants.ResponseCodes.Err, onErr);

                // query device
                await this.sendCommandDeviceQuery(appTargetVer);

            } catch(e) {
                reject(e);
            }
        });
    }

    exportPrivateKey() {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive private Key
                const onPrivateKey = (response) => {
                    this.off(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject();
                }

                // reject promise when we receive disabled
                const onDisabled = () => {
                    this.off(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject("disabled");
                }

                // listen for events
                this.once(Constants.ResponseCodes.PrivateKey, onPrivateKey);
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Disabled, onDisabled);

                // export private key
                await this.sendCommandExportPrivateKey();

            } catch(e) {
                reject(e);
            }
        });
    }

    importPrivateKey(privateKey) {
        return new Promise(async (resolve, reject) => {
            try {

                // resolve promise when we receive ok
                const onOk = (response) => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    resolve(response);
                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject();
                }

                // reject promise when we receive disabled
                const onDisabled = () => {
                    this.off(Constants.ResponseCodes.Ok, onOk);
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Disabled, onDisabled);
                    reject("disabled");
                }

                // listen for events
                this.once(Constants.ResponseCodes.Ok, onOk);
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Disabled, onDisabled);

                // import private key
                await this.sendCommandImportPrivateKey(privateKey);

            } catch(e) {
                reject(e);
            }
        });
    }

    login(contactPublicKey, password, extraTimeoutMillis = 1000) {
        return new Promise(async (resolve, reject) => {
            try {

                // get public key prefix we expect in the login response
                const publicKeyPrefix = contactPublicKey.subarray(0, 6);

                // listen for sent response so we can get estimated timeout
                const onSent = (response) => {

                    // remove error listener since we received sent response
                    this.once(Constants.ResponseCodes.Err, onErr);

                    // reject login request as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    setTimeout(() => {
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive login success push code
                const onLoginSuccess = (response) => {

                    // make sure login success response is for this login request
                    if(!BufferUtils.areBuffersEqual(publicKeyPrefix, response.pubKeyPrefix)){
                        console.log("onLoginSuccess is not for this login request, ignoring...");
                        return;
                    }

                    // login successful
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.LoginSuccess, onLoginSuccess);
                    resolve(response);

                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.LoginSuccess, onLoginSuccess);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.PushCodes.LoginSuccess, onLoginSuccess);

                // login
                await this.sendCommandSendLogin(contactPublicKey, password);

            } catch(e) {
                reject(e);
            }
        });
    }

    getStatus(contactPublicKey, extraTimeoutMillis = 1000) {
        return new Promise(async (resolve, reject) => {
            try {

                // get public key prefix we expect in the status response
                const publicKeyPrefix = contactPublicKey.subarray(0, 6);

                // listen for sent response so we can get estimated timeout
                const onSent = (response) => {

                    // remove error listener since we received sent response
                    this.once(Constants.ResponseCodes.Err, onErr);

                    // reject login request as timed out after estimated delay, plus a bit extra
                    const estTimeout = response.estTimeout + extraTimeoutMillis;
                    setTimeout(() => {
                        reject("timeout");
                    }, estTimeout);

                }

                // resolve promise when we receive status response push code
                const onStatusResponsePush = (response) => {

                    // make sure login success response is for this login request
                    if(!BufferUtils.areBuffersEqual(publicKeyPrefix, response.pubKeyPrefix)){
                        console.log("onStatusResponsePush is not for this status request, ignoring...");
                        return;
                    }

                    // status request successful
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.StatusResponse, onStatusResponsePush);

                    // parse repeater stats from status data
                    const bufferReader = new BufferReader(response.statusData);
                    const repeaterStats = {
                        batt_milli_volts: bufferReader.readUInt16LE(), // uint16_t batt_milli_volts;
                        curr_tx_queue_len: bufferReader.readUInt16LE(), // uint16_t curr_tx_queue_len;
                        curr_free_queue_len: bufferReader.readUInt16LE(), // uint16_t curr_free_queue_len;
                        last_rssi: bufferReader.readInt16LE(), // int16_t  last_rssi;
                        n_packets_recv: bufferReader.readUInt32LE(), // uint32_t n_packets_recv;
                        n_packets_sent: bufferReader.readUInt32LE(), // uint32_t n_packets_sent;
                        total_air_time_secs: bufferReader.readUInt32LE(), // uint32_t total_air_time_secs;
                        total_up_time_secs: bufferReader.readUInt32LE(), // uint32_t total_up_time_secs;
                        n_sent_flood: bufferReader.readUInt32LE(), // uint32_t n_sent_flood
                        n_sent_direct: bufferReader.readUInt32LE(), // uint32_t n_sent_direct
                        n_recv_flood: bufferReader.readUInt32LE(), // uint32_t n_recv_flood
                        n_recv_direct: bufferReader.readUInt32LE(), // uint32_t n_recv_direct
                        n_full_events: bufferReader.readUInt16LE(), // uint16_t n_full_events
                        last_snr: bufferReader.readInt16LE(), // int16_t last_snr
                        n_direct_dups: bufferReader.readUInt16LE(), // uint16_t n_direct_dups
                        n_flood_dups: bufferReader.readUInt16LE(), // uint16_t n_flood_dups
                    }

                    resolve(repeaterStats);

                }

                // reject promise when we receive err
                const onErr = () => {
                    this.off(Constants.ResponseCodes.Err, onErr);
                    this.off(Constants.ResponseCodes.Sent, onSent);
                    this.off(Constants.PushCodes.StatusResponse, onStatusResponsePush);
                    reject();
                }

                // listen for events
                this.once(Constants.ResponseCodes.Err, onErr);
                this.once(Constants.ResponseCodes.Sent, onSent);
                this.once(Constants.PushCodes.StatusResponse, onStatusResponsePush);

                // request status
                await this.sendCommandSendStatusReq(contactPublicKey);

            } catch(e) {
                reject(e);
            }
        });
    }

}

export default Connection;
