import { useAuth } from '@/src/hooks/authentication/useAuth';
import { Socket } from 'socket.io-client';
import { MdManageAccounts } from 'react-icons/md';

interface IProps {
  socket: Socket | undefined;
}

export default function AdminShortcuts({ socket }: IProps) {
  const { auth } = useAuth();
  return socket && auth?.isAdmin ? (
    <div className="drawer drawer-end">
      <input id="admin-shortcut-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Page content here */}
        <label
          htmlFor="admin-shortcut-drawer"
          className="drawer-button btn btn-primary fixed top-1/2 right-0 -translate-y-2/4 rounded-none"
        >
          <MdManageAccounts size={20} />
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="admin-shortcut-drawer" className="drawer-overlay"></label>
        <div className="pt-[80px] pb-4 px-4 w-80 h-full bg-base-200 text-base-content">
          <div className="border border-gray-500">
            <h3 className="pt-2 text-[18ps] font-bold text-center">Logs</h3>
            <ul className="flex flex-col gap-3 p-3">
              <li className="btn btn-success" onClick={() => socket.emit('admin:log-matcher-rooms')}>
                <p>Matcher Rooms</p>
              </li>
              <li className="btn btn-success" onClick={() => socket.emit('admin:log-competitive-rooms')}>
                <p>Competitive Rooms</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
