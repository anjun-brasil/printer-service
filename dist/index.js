"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_printer_1 = require("@grandchef/node-printer");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
    io.on('connection', (socket) => {
        console.log('user connected', socket.id);
        socket.emit('connection', null);
        socket.on('listPrinters', () => {
            const printerList = (0, node_printer_1.getPrinters)();
            socket.emit('printerList', printerList);
        });
        socket.on('printZpl', (obj) => {
            console.log(obj);
            (0, node_printer_1.printDirect)({
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
