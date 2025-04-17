const WebSocket = require('ws');
const dgram = require('dgram');

// 配置
const WS_PORT = 8081;           // WebSocket服务器端口

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket服务器启动在端口 ${WS_PORT}`);

// 创建UDP客户端
const udpClient = dgram.createSocket('udp4');

// 处理WebSocket连接
wss.on('connection', (ws) => {
    console.log('新的WebSocket连接建立');
    let udpTargetPort = 12345;  // 默认UDP目标端口
    let udpTargetIp = '127.0.0.1'; // 默认UDP目标IP

    // 处理接收到的消息
    ws.on('message', (data) => {
        try {
            // 尝试解析为JSON，检查是否是配置消息
            const jsonData = JSON.parse(data.toString());
            if (jsonData.type === 'config') {
                udpTargetIp = jsonData.udpTargetIp;
                udpTargetPort = jsonData.udpTargetPort;
                console.log(`更新UDP目标地址：${udpTargetIp}:${udpTargetPort}`);
                return;
            }
        } catch (e) {
            // 如果不是JSON，则按照普通数据包处理
        }

        // 确保数据是Buffer类型
        if (Buffer.isBuffer(data)) {
            // 将数据转发到UDP目标
            udpClient.send(data, udpTargetPort, udpTargetIp, (error) => {
                if (error) {
                    console.error('UDP发送错误:', error);
                    ws.send(JSON.stringify({ type: 'error', message: error.message }));
                } else {
                    console.log(`发送UDP数据包到 ${udpTargetIp}:${udpTargetPort}: ${data.toString('hex').toUpperCase()}`);
                }
            });
        } else {
            console.warn('收到非Buffer类型数据');
        }
    });

    // 处理连接关闭
    ws.on('close', () => {
        console.log('WebSocket连接关闭');
    });

    // 处理错误
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
    });
});

// 处理UDP客户端错误
udpClient.on('error', (error) => {
    console.error('UDP客户端错误:', error);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    wss.close(() => {
        console.log('WebSocket服务器已关闭');
        udpClient.close(() => {
            console.log('UDP客户端已关闭');
            process.exit(0);
        });
    });
}); 