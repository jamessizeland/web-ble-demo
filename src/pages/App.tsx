import RenderBox from 'features/RenderBox';
import { useBLE } from 'hooks/useBLE'
import { useEffect, useState } from 'react';
import { notify } from 'services/notifications';

const App = (): JSX.Element => {
  const {
    connectToDevice,
    disconnectDevice,
    device,
    server,
    characteristics,
    metaData,
  } = useBLE();
  const [rotations, setRotations] = useState({
    rotateX: { up: false, down: false },
    rotateY: { up: false, down: false },
    rotateZ: { up: false, down: false },
  });
  useEffect(() => {
    const buttonMeta = metaData[0].characteristics;
    const buttonService = characteristics.get(metaData[0].uuid);
    const rotateX = {
      up: buttonService?.get(buttonMeta[0].uuid)?.data?.getInt8(0) === 1,
      down: buttonService?.get(buttonMeta[1].uuid)?.data?.getInt8(0) === 1
    };
    const rotateY = {
      up: buttonService?.get(buttonMeta[2].uuid)?.data?.getInt8(0) === 1,
      down: buttonService?.get(buttonMeta[3].uuid)?.data?.getInt8(0) === 1
    };
    const rotateZ = {
      up: buttonService?.get(buttonMeta[4].uuid)?.data?.getInt8(0) === 1,
      down: buttonService?.get(buttonMeta[5].uuid)?.data?.getInt8(0) === 1
    };
    setRotations({ rotateX, rotateY, rotateZ });
  }, [characteristics]);

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
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="text-left">Service</th>
                  <th className="text-left">Characteristic</th>
                  <th className="text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(characteristics.entries()).map(([_, characteristicData]) =>
                  Array.from(characteristicData.entries()).map(([characteristic, { name, data, service }]) => (
                    <tr key={`${service}-${characteristic}`} className="hover:bg-gray-100">
                      <td>{service}</td>
                      <td>{name}</td>
                      <td>{data ? data.getInt8(0) : 'No Value'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <RenderBox
              rotateX={rotations.rotateX}
              rotateY={rotations.rotateY}
              rotateZ={rotations.rotateZ}
              analogX={characteristics.get(metaData[1].uuid)?.get(metaData[1].characteristics[1].uuid)?.data?.getInt8(0) ?? 0}
              analogY={characteristics.get(metaData[1].uuid)?.get(metaData[1].characteristics[0].uuid)?.data?.getInt8(0) ?? 0}
            />
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
