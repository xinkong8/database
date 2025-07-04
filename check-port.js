const net = require('net');

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // 端口可用
      });
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // 端口被占用
      } else {
        reject(err);
      }
    });
  });
}

async function main() {
  const targetPort = 9527;
  console.log(`检查端口 ${targetPort} 是否可用...`);
  
  try {
    const isAvailable = await checkPort(targetPort);
    
    if (isAvailable) {
      console.log(`✓ 端口 ${targetPort} 可用`);
      process.exit(0);
    } else {
      console.error(`✗ 端口 ${targetPort} 已被占用`);
      console.error(`请关闭占用端口 ${targetPort} 的程序，或者修改配置使用其他端口`);
      
      // 查找占用端口的进程（Windows）
      if (process.platform === 'win32') {
        console.log(`\n可以使用以下命令查找占用端口的进程：`);
        console.log(`netstat -ano | findstr :${targetPort}`);
        console.log(`然后使用 taskkill /PID <PID> /F 来结束进程`);
      } else {
        console.log(`\n可以使用以下命令查找占用端口的进程：`);
        console.log(`lsof -ti:${targetPort}`);
        console.log(`然后使用 kill -9 <PID> 来结束进程`);
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('检查端口时发生错误:', error);
    process.exit(1);
  }
}

main(); 