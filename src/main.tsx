import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'pages/App';
import { BLEProvider, GattService } from 'hooks/useBLE';

import './style/global.scss';
import './style/tailwind.css';


const buttonService: GattService = {
  name: "Buttons",
  uuid: "260279e7-a5dd-447b-9bd8-e624ef464d6e",
  characteristics: [
    { uuid: "c665eb11-eee4-452b-9047-a98a3916bd80", name: "A" },
    { uuid: "7c9a1a08-ecf2-4f7d-a24b-0ab01615cc77", name: "B" },
    { uuid: "163a7681-4b8b-4249-899d-ae1a634ce692", name: "C" },
    { uuid: "c8ede9b0-4eeb-4f31-b8d4-f920881961fa", name: "D" },
    { uuid: "7729d82d-a8b9-4c3e-95bf-3794b70aba56", name: "E" },
    { uuid: "f8f17954-f235-4d71-8ece-1522ec067c55", name: "F" },
  ],
}

const StickService: GattService = {
  name: "Analogue Stick",
  uuid: "7e701cf1-b1df-42a1-bb5f-6a1028c793b0",
  characteristics: [
    { uuid: "e3d1afe4-b414-44e3-be54-0ea26c394eba", name: "X" },
    { uuid: "65133212-952b-4000-a735-ea558db3ca7b", name: "Y" },
  ],
}

const options: RequestDeviceOptions = {
  acceptAllDevices: true,
  optionalServices: [
    buttonService.uuid,
    StickService.uuid,
  ],
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BLEProvider options={options} metaData={[buttonService, StickService]}>
      <App />
    </BLEProvider>
  </React.StrictMode >,
);
