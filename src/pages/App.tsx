import { useBLE } from 'hooks/useBLE'
import { notify } from 'services/notifications';

const App = (): JSX.Element => {
  const {
    connectToDevice,
    disconnectDevice,
    device,
    server,
    services,
    characteristics
  } = useBLE();
  return (
    <div className="m-2">
      <div className="flex flex-col">
        <p>name: {device?.name}</p>
        <p>id: {device?.id}</p>
        <p>gatt: {device?.gatt?.connected ? "connected" : "disconnected"}</p>
        <p>server: {server?.connected ? "connected" : "disconnected"}</p>
        <button type="button" className='btn btn-primary' onClick={async () => {
          await connectToDevice();
          notify('Connected to device');
        }}>Scan for Devices</button>
        <br />
        {device ? (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Service UUID</th>
                  <th>Characteristic UUID</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(characteristics.entries()).map(([serviceUuid, characteristicData]) =>
                  Array.from(characteristicData.entries()).map(([characteristic, value]) => (
                    <tr key={`${serviceUuid}-${characteristic.uuid}`}>
                      <td>{serviceUuid}</td>
                      <td>{characteristic.uuid}</td>
                      <td>{value ? value.getInt8(0) : 'No Value'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <br />
            <button type="button" className='btn btn-primary' onClick={async () => {
              disconnectDevice();
              notify('Disconnected from device');
            }}>Disconnect</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default App;
