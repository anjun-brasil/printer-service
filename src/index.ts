import { getPrinters, printDirect } from '@grandchef/node-printer';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const bootstrap = async () => {
  const app = express();
  app.use(cors());
  const server = http.createServer(app);

  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    socket.emit('connection', null);

    socket.on('listPrinters', () => {
      const printerList = getPrinters();

      socket.emit('printerList', printerList);
    });

    socket.on('printZpl', (obj: { selectedPrinter: string; zpl: string }) => {
      console.log(obj);
      printDirect({
        data: obj.zpl,
        printer: obj.selectedPrinter,
        error: (e) => {
          console.log(e);
          socket.emit('printError', e);
        },
        success: (jobId) => {
          console.log(`print success jobId: ${jobId}`);
          socket.emit('printSuccess', jobId);
        },
      });
    });

    socket.on('ping', () => {
      console.log('sending pong to client');

      socket.emit('pong');
    });
  });

  const PORT = process.env.PORT || 8475;
  server.listen(PORT, () => {
    console.log(`[🖨️] print service running at localhost:${PORT}`);
  });
};

bootstrap();
