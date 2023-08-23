import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { ServerSocket } from './socket';
import { AuthRoute } from './routes/auth.route';
ValidateEnv();

const app = new App([new AuthRoute()]);
const socket = new ServerSocket(app);

app.listen();
socket.listen();
