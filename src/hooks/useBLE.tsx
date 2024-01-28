import React, { useState, createContext, useContext } from 'react';

interface BLEContextType {
    device: BluetoothDevice | null;
    server: BluetoothRemoteGATTServer | null;
    services: BluetoothRemoteGATTService[];
    metaData: GattService[];
    characteristics: Map<string, GattCharacteristicData>;
    connectToDevice: () => Promise<void>;
    disconnectDevice: () => void;
}

interface BLEProviderProps {
    children: React.ReactNode;
    options?: RequestDeviceOptions;
    metaData?: GattService[];
}

export interface GattService {
    name: string;
    uuid: string;
    characteristics: GattCharacteristic[];
}

export interface GattCharacteristic {
    name: string;
    uuid: string;
}

export type GattCharacteristicData = Map<string, { service: string, name: string, data: DataView | null }>;

const BLEContext = createContext<BLEContextType | null>(null);

export const BLEProvider = ({ children, options = { acceptAllDevices: true }, metaData = [] }: BLEProviderProps) => {
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
        for (const service of metaData!) {
            const primaryService = await server.getPrimaryService(service.uuid);
            if (primaryService) services.push(primaryService);
        };
        setServices(services);
        return services;
    };

    // Register all characteristics for each service
    const registerGattCharacteristics = async (services: BluetoothRemoteGATTService[]) => {
        let serviceMap: Map<string, GattCharacteristicData> = new Map();
        for (const i in services) {
            const chars = await services[i].getCharacteristics();
            console.log({ service: services[i], chars, meta: metaData[i] });
            chars.forEach((characteristic) => {
                characteristic.addEventListener('characteristicvaluechanged', handleChange);
                characteristic.startNotifications().catch(error => console.error('Error starting notifications:', error));
            });
            let charMap: GattCharacteristicData = new Map();
            chars.forEach((characteristic, j) => charMap.set(characteristic.uuid, {
                service: metaData[i].name,
                name: metaData[i].characteristics[j].name,
                data: null
            }));
            serviceMap.set(services[i].uuid, charMap);
        };
        setCharacteristics(serviceMap);
    }

    // Handle changes to the characteristic value
    const handleChange = (event: Event) => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        console.log(`Characteristic ${characteristic.service.uuid} value changed to ${characteristic.value?.getInt8(0)}`);
        // Update the characteristic value in the characteristics map
        console.log(characteristics);
        setCharacteristics(prevCharacteristics => {
            // Create a new Map from the previous characteristics
            const newCharacteristics = new Map(prevCharacteristics);
            const service = newCharacteristics.get(characteristic.service.uuid);
            const character = service?.get(characteristic.uuid);
            if (character) {
                // Create a new Map from the service
                const newService = new Map(service);
                newService.set(characteristic.uuid, { ...character, data: characteristic.value! });
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
            metaData,
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
