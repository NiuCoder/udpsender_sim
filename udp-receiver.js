const dgram = require('dgram');
const server = dgram.createSocket('udp4');

// 配置
const PORT = 12345;
const HOST = '127.0.0.1';

// 启动服务器
server.on('listening', () => {
    const address = server.address();
    console.log(`UDP接收器启动成功:`);
    console.log(`- 地址: ${address.address}`);
    console.log(`- 端口: ${address.port}`);
    console.log('\n等待接收数据...\n');
});

// 接收数据
server.on('message', (message, remote) => {
    try {
        // 解析数据包
        if (message.length !== 13) {
            throw new Error(`数据包长度错误: ${message.length} 字节 (应为13字节)`);
        }

        // 获取各字段值
        const frameType = message[0];
        const lifeSignal = message.readUInt16BE(1);
        const driveMode = message[3];
        const workTime = message.readUInt16BE(4);
        const mileage = message.readUInt16BE(6);
        const position = message.readUInt16BE(8);
        const speed = message.readUInt16BE(10);
        const battery = message[12];

        // 验证字段
        if (frameType !== 0x86) {
            throw new Error(`帧类型错误: 0x${frameType.toString(16)} (应为0x86)`);
        }

        if (![0, 1, 2].includes(driveMode)) {
            throw new Error(`驾驶模式错误: ${driveMode} (应为0、1或2)`);
        }

        if (battery > 100) {
            throw new Error(`电量值错误: ${battery} (应为0-100)`);
        }

        // 打印数据包信息
        console.log('收到数据包:');
        console.log(`来源: ${remote.address}:${remote.port}`);
        console.log('数据内容:');
        console.log(`- 帧类型: 0x${frameType.toString(16).padStart(2, '0')}`);
        console.log(`- 生命信号: ${lifeSignal}`);
        console.log(`- 驾驶模式: ${driveMode} (${getDriveModeString(driveMode)})`);
        console.log(`- 工作时长: ${workTime}小时`);
        console.log(`- 运行里程: ${mileage}千米`);
        console.log(`- 当前位置: ${position}米`);
        console.log(`- 速度: ${(speed/100).toFixed(2)}m/s`);
        console.log(`- 电量: ${battery}%`);
        console.log('\n原始数据:');
        console.log(message.toString('hex').toUpperCase().match(/.{2}/g).join(' '));
        console.log('\n' + '='.repeat(50) + '\n');
    } catch (error) {
        console.error('数据包解析错误:', error.message);
        console.error('原始数据:', message.toString('hex').toUpperCase());
        console.log('\n' + '='.repeat(50) + '\n');
    }
});

// 错误处理
server.on('error', (err) => {
    console.error('UDP接收器错误:', err);
    server.close();
});

// 绑定端口
server.bind(PORT, HOST);

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n正在关闭UDP接收器...');
    server.close(() => {
        console.log('UDP接收器已关闭');
        process.exit(0);
    });
});

// 辅助函数：获取驾驶模式字符串
function getDriveModeString(mode) {
    switch (mode) {
        case 0: return '人工驾驶';
        case 1: return '远程驾驶';
        case 2: return '自动驾驶';
        default: return '未知模式';
    }
}