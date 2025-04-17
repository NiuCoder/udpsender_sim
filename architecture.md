 # UDP测试工具软件架构文档

## 1. 整体架构

### 1.1 系统结构
整个系统采用单页面应用程序设计，所有功能集成在一个HTML文件中，分为以下几个主要模块：

```
index.html
├── 用户界面层（UI Layer）
├── 业务逻辑层（Business Layer）
├── 数据处理层（Data Layer）
└── 通信层（Communication Layer）
```

### 1.2 模块职责

#### 1.2.1 用户界面层（UI Layer）
- 参数设置面板
  - IP地址和端口输入
  - 驾驶模式选择
  - 各项参数输入控件
  - 启动/停止控制按钮
- 数据显示面板
  - 当前参数值显示
  - 十六进制数据包显示
  - 发送状态和计数显示
  - 运行时间显示

#### 1.2.2 业务逻辑层（Business Layer）
- 参数验证模块
  - 输入范围检查
  - 数据格式验证
  - 实时参数更新
- 定时器管理
  - UDP发送定时器控制
  - 运行时间计时器
  - 界面更新定时器
- 状态管理
  - 运行状态控制
  - 错误状态处理
  - 配置状态保存

#### 1.2.3 数据处理层（Data Layer）
- 数据包构建器
  - 大端序数据转换
  - 二进制数据包组装
  - 数据类型转换
- 配置管理器
  - LocalStorage数据存取
  - 配置序列化/反序列化
  - 默认值管理

#### 1.2.4 通信层（Communication Layer）
- UDP通信模块
  - WebSocket连接管理
  - 数据包发送
  - 错误处理和重连

## 2. 关键类设计

### 2.1 UdpPacketBuilder（数据包构建器）
```javascript
class UdpPacketBuilder {
    constructor();
    setFrameType(type: number): void;
    setLifeSignal(signal: number): void;
    setDriveMode(mode: number): void;
    setWorkTime(time: number): void;
    setMileage(distance: number): void;
    setPosition(position: number): void;
    setSpeed(speed: number): void;
    setBattery(level: number): void;
    build(): ArrayBuffer;
}
```

### 2.2 ConfigManager（配置管理器）
```javascript
class ConfigManager {
    constructor();
    saveConfig(config: object): void;
    loadConfig(): object;
    getDefaultConfig(): object;
    resetConfig(): void;
}
```

### 2.3 UdpSender（UDP发送器）
```javascript
class UdpSender {
    constructor(ip: string, port: number);
    connect(): Promise<void>;
    send(data: ArrayBuffer): Promise<void>;
    disconnect(): void;
    onError(callback: Function): void;
}
```

### 2.4 UIController（界面控制器）
```javascript
class UIController {
    constructor();
    bindEvents(): void;
    updateDisplay(data: object): void;
    showError(message: string): void;
    updateStatus(status: string): void;
    updatePacketCount(count: number): void;
}
```

## 3. 数据流

### 3.1 参数设置流程
1. 用户在界面输入参数
2. UIController接收输入事件
3. 业务逻辑层验证参数
4. 数据处理层更新配置
5. 界面更新显示

### 3.2 数据包发送流程
1. 定时器触发发送事件
2. UdpPacketBuilder构建数据包
3. UdpSender发送数据包
4. 更新发送状态和计数
5. 界面更新显示

## 4. 错误处理

### 4.1 输入验证错误
- 范围检查
- 格式验证
- 实时反馈

### 4.2 网络错误
- 连接失败处理
- 发送超时处理
- 自动重连机制

### 4.3 运行时错误
- 异常捕获
- 错误日志
- 用户提示

## 5. 性能考虑

### 5.1 定时器优化
- 使用requestAnimationFrame进行界面更新
- 合理设置UDP发送间隔
- 避免频繁DOM操作

### 5.2 数据处理优化
- 使用TypedArray和DataView处理二进制数据
- 缓存常用数据
- 减少不必要的数据转换

### 5.3 内存管理
- 及时清理不用的事件监听
- 控制数据包缓存大小
- 避免内存泄漏

## 6. 扩展性设计

### 6.1 模块化
- 清晰的模块边界
- 独立的功能单元
- 松耦合设计

### 6.2 配置化
- 可配置的UDP参数
- 可自定义的界面布局
- 可扩展的数据格式