class Constants {

    static SerialFrameTypes = {
        Incoming: 0x3e, // ">"
        Outgoing: 0x3c, // "<"
    };

    static CommandCodes = {
        AppStart: 1,
        SendTxtMsg: 2,
        SendChannelTxtMsg: 3, // todo
        GetContacts: 4,
        GetDeviceTime: 5,
        SetDeviceTime: 6,
        SendSelfAdvert: 7,
        SetAdvertName: 8,
        AddUpdateContact: 9,
        SyncNextMessage: 10,
        SetRadioParams: 11,
        SetTxPower: 12,
        SetAdvertLatLon: 14,
        RemoveContact: 15,
    }

    static ResponseCodes = {
        Ok: 0, // todo
        Err: 1, // todo
        ContactsStart: 2,
        Contact: 3,
        EndOfContacts: 4,
        SelfInfo: 5,
        Sent: 6,
        ContactMsgRecv: 7,
        ChannelMsgRecv: 8, // todo
        CurrTime: 9,
        NoMoreMessages: 10,
    }

    static PushCodes = {
        Advert: 0x80,
        PathUpdated: 0x81, // todo
        SendConfirmed: 0x82,
        MsgWaiting: 0x83,
    }

    static AdvType = {
        None: 0,
        Chat: 1,
        Repeater: 2,
        Room: 3,
    }

    static SelfAdvertTypes = {
        ZeroHop: 0,
        Flood: 1,
    }

    static TxtTypes = {
        Plain: 0,
        CliData: 1,
        SignedPlain: 2,
    }

}

export default Constants;
