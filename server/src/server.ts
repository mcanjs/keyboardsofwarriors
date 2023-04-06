import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UserRoute } from '@routes/users.route';
import { ValidateEnv } from '@utils/validateEnv';
import { ServerSocket } from './socket';

ValidateEnv();

const app = new App([new UserRoute(), new AuthRoute()]);
const socket = new ServerSocket(app.getServer());

socket.listen();
