# WebSocket Timer

一个基于Vite和WebSocket技术构建的实时计时器demo，支持多个客户端之间的计时同步。使用SharedWorker实现高性能的计时功能。

## Features

- 基于SharedWorker的高性能计时器
- WebSocket实时通信，支持多客户端同步
- 自动重连和心跳检测机制
- 使用Vite构建，支持热更新

## Requirements

- Node.js 16+
- 现代浏览器（支持WebSocket和SharedWorker）

## Installation

1. 克隆项目代码：
```bash
git clone https://github.com/yourusername/websocket-timer.git
cd websocket-timer
```

2. 安装依赖包：
```bash
npm install
```

## Usage

1. 开发模式启动：
```bash
npm run dev
```

2. 构建生产版本：
```bash
npm run build
```

3. 预览生产版本：
```bash
npm run preview
```

访问Vite开发服务器提供的地址（默认为 http://localhost:5173）即可使用应用。

## Project Structure

```
websocket-timer/
├── src/                    # 源代码目录
│   ├── TimerWorker/       # 计时器Worker单例相关代码
│   ├── hooks/             # 自定义Hook
│   └── worker/            # 计时器Worker
├── public/                # 静态资源目录
├── dist/                  # 构建输出目录
├── index.html             # 项目入口HTML
├── vite.config.ts         # Vite配置文件
├── tsconfig.json          # TypeScript配置
├── package.json           # 项目配置和依赖管理
├── .env                   # 环境变量
└── README.md             # 项目文档
```

## How It Works

应用使用SharedWorker实现高性能的计时器功能，同步多个客户端之间的计时，稳定发送心跳消息。

## Contributing

欢迎提交问题和改进建议

## License

本项目采用MIT许可证 - 详见LICENSE文件
