import { DataType, buffer_decode, hex2buffer, buffer_encode, buffer2hex } from ".";

(async () => {
    let hex = "3836313035303034303135343836393839383631313138323839303035333337353532374238393A3B3E3F3C3D6421C0004E61BC0085FFFFFF4E61BC00D20439300000";
    let config = [
        {
            Name: 'IMEI',
            Code: 'IMEI',
            Type: DataType.ascii,
            Len: 15,
            Memo: 'IMEI',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'CCID',
            Code: 'CCID',
            Type: DataType.ascii,
            Len: 20,
            Memo: 'CCID',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'CSQ',
            Code: 'CSQ',
            Type: DataType.uint,
            Len: 1,
            Memo: 'CSQ',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'ECL',
            Code: 'ECL',
            Type: DataType.uint,
            Len: 1,
            Memo: 'ECL',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'RSRP',
            Code: 'RSRP',
            Type: DataType.uint,
            Len: 2,
            Memo: 'RSRP',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'RSRQ',
            Code: 'RSRQ',
            Type: DataType.uint,
            Len: 2,
            Memo: 'RSRQ',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'SNR',
            Code: 'SNR',
            Type: DataType.uint,
            Len: 2,
            Memo: 'SNR',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'RSSI',
            Code: 'RSSI',
            Type: DataType.uint,
            Len: 2,
            Memo: 'RSSI',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'V',
            Code: 'V',
            Type: DataType.uint,
            Len: 1,
            Memo: 'V',
            Unit: 0,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: 'Vol',
            Code: 'Vol',
            Type: DataType.uint,
            Len: 1,
            Memo: 'Vol',
            Unit: 0.1,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: '水表状态',
            Code: 'Status',
            Type: DataType.bit,
            Len: 2,
            Memo: 'Status',
            Unit: 0,
            ArrayLen: 0,
            Config: [
                {
                    Name: '阀门状态',
                    Code: 'Door',
                    Type: DataType.bit,
                    Len: 2,
                    Memo: '00:阀门开，01阀门关，11：阀门故障',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OPEN',
                        1: 'CLOSE',
                        2: 'UNKNOW',
                        3: 'ERROR',
                    }
                },
                {
                    Name: '低电压告警',
                    Code: 'Vol',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '磁干扰告警',
                    Code: 'Magnetism',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '光扰告警',
                    Code: 'Light',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '脉冲告警',
                    Code: 'Pulse',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '开盖告警',
                    Code: 'Open',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '余额不足',
                    Code: 'Left',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '欠费',
                    Code: 'Negative',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '过流',
                    Code: 'Max',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
                {
                    Name: '反流',
                    Code: 'Min',
                    Type: DataType.bit,
                    Len: 1,
                    Memo: '1告警,0正常',
                    Unit: 0,
                    Offset: 0,
                    ArrayLen: 0,
                    Map: {
                        0: 'OK',
                        1: 'ERROR',
                    }
                },
            ]
        },
        {
            Name: '当前用水总量',
            Code: 'Total',
            Type: DataType.int,
            Len: 4,
            Memo: 'Status',
            Unit: 1,
            ArrayLen: 0,
            Config: [

            ]
        },
        {
            Name: '当前剩余水费',
            Code: 'Left',
            Type: DataType.int,
            Len: 4,
            Memo: '单位0.01元，1元表示为100（10进制）有符号数',
            Unit: 0.01,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: '日冻结日用水总量',
            Code: 'DayTotal',
            Type: DataType.uint,
            Len: 4,
            Memo: '单位L',
            Unit: 1,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: '日冻结最大流速',
            Code: 'DayFlow',
            Type: DataType.uint,
            Len: 2,
            Memo: '单位L/min',
            Unit: 1,
            ArrayLen: 0,
            Config: []
        },
        {
            Name: '日冻结最大流速时间戳',
            Code: 'DayFlowTime',
            Type: DataType.timestamp,
            Len: 4,
            Memo: '秒级',
            Unit: 1,
            ArrayLen: 0,
            Config: []
        },
    ];
    // let t = {};
    // let rs = buffer_decode(hex2buffer(hex), t, config);
    // let encode_rs = buffer_encode(rs.obj, config);
    // // debugger
    // console.log(rs, t)
    // console.log(buffer2hex(hex2buffer(hex)))
    // console.log(buffer2hex(encode_rs.buf) == buffer2hex(hex2buffer(hex)))
})()