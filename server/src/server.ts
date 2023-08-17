import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { ServerSocket } from './socket';
ValidateEnv();

const app = new App([]);
const socket = new ServerSocket(app);

app.listen();
socket.listen();
