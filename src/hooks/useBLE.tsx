import React, { useState, createContext, useContext } from 'react';

interface BLEContextType {
    device: BluetoothDevice | null;
    server: BluetoothRemoteGATTServer | null;
    services: BluetoothRemoteGATTService[];
    gattServices: GattService[];
    characteristics: Map<string, GattCharacteristicData>;
    connectToDevice: () => Promise<void>;
    disconnectDevice: () => void;
}

interface BLEProviderProps {
    children: React.ReactNode;
    options?: RequestDeviceOptions;
    gattServices?: GattService[];
}

export interface GattService {
    uuid: string;
    characteristics: GattCharacteristic[];
}

export interface GattCharacteristic {
    uuid: string;
}

export type GattCharacteristicData = Map<BluetoothRemoteGATTCharacteristic, DataView | null>;

const BLEContext = createContext<BLEContextType | null>(null);

export const BLEProvider = ({ children, options = { acceptAllDevices: true }, gattServices = [] }: BLEProviderProps) => {
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
    const [services, setServices] = useState<BluetoothRemoteGATTService[]>([]);
    const [characteristics, setCharacteristics] = useState<Map<string, GattCharacteristicData>>(new Map());

    const connectToDevice = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice(options);
            setDevice(device);
            console.log('Connected to device:', device.name);
            // Additional connection logic
            const server = await device?.gatt?.connect();
            if (server) {
                const services = await registerPrimaryServices(server);
                console.log({ services });
                await registerGattCharacteristics(services);
                setServer(server);
            }
        } catch (error) {
            console.error('Error connecting to BLE device:', error);
        }
    };

    const registerPrimaryServices = async (server: BluetoothRemoteGATTServer) => {
        setServices([]);
        let services = [];
        for (const service of gattServices!) {
            const primaryService = await server.getPrimaryService(service.uuid);
            if (primaryService) services.push(primaryService);
        };
        setServices(services);
        return services;
    };

    const registerGattCharacteristics = async (services: BluetoothRemoteGATTService[]) => {
        let serviceMap: Map<string, GattCharacteristicData> = new Map();
        for (const service of services) {
            const characteristics = await service.getCharacteristics();
            console.log({ service, characteristics });
            characteristics.forEach(characteristic => {
                characteristic.addEventListener('characteristicvaluechanged', handleChange);
                characteristic.startNotifications().catch(error => console.error('Error starting notifications:', error));
            });
            let charMap: GattCharacteristicData = new Map();
            characteristics.forEach(characteristic => charMap.set(characteristic, null));
            serviceMap.set(service.uuid, charMap);
        };
        setCharacteristics(serviceMap);
    }

    const handleChange = (event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        console.log(`Characteristic ${characteristic.service.uuid} value changed to ${characteristic.value?.getInt8(0)}`);
        // Update the characteristic value in the characteristics map
        console.log(characteristics);
        setCharacteristics(prevCharacteristics => {
            // Create a new Map from the previous characteristics
            const newCharacteristics = new Map(prevCharacteristics);
            const service = newCharacteristics.get(characteristic.service.uuid);
            if (service?.has(characteristic)) {
                // Create a new Map from the service
                const newService = new Map(service);
                newService.set(characteristic, characteristic.value!);
                newCharacteristics.set(characteristic.service.uuid, newService);
            }
            return newCharacteristics;
        });
    };

    const disconnectDevice = () => {
        // Disconnect logic
        console.log('Disconnected from device:', device?.name);
        device?.gatt?.disconnect();
        setDevice(null);
    };

    return (
        <BLEContext.Provider value={{
            device,
            connectToDevice,
            disconnectDevice,
            server,
            services,
            gattServices,
            characteristics,
        }}>
            {children}
        </BLEContext.Provider>
    );
};

// Custom hook to use the BLE context
export const useBLE = () => {
    const context = useContext(BLEContext);
    if (!context) {
        throw new Error('useBLE must be used within a BLEProvider');
    }
    return context;
};
