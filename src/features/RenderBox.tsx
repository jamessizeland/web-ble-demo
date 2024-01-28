import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

interface BoxProps {
    rotateX: { up: boolean, down: boolean };
    rotateY: { up: boolean, down: boolean };
    rotateZ: { up: boolean, down: boolean };
    analogX: number;
    analogY: number;
}

function Box(props: BoxProps) {
    const ref = useRef<THREE.Mesh>(null!);
    const ref2 = useRef<THREE.Mesh>(null!);

    useFrame(() => {
        const delta = 0.1;
        if (props.rotateX.up) ref.current.rotation.x += delta;
        else if (props.rotateX.down) ref.current.rotation.x -= delta;
        if (props.rotateY.up) ref.current.rotation.y += delta;
        else if (props.rotateY.down) ref.current.rotation.y -= delta;
        if (props.rotateZ.up) ref.current.rotation.z += delta;
        else if (props.rotateZ.down) ref.current.rotation.z -= delta;
    });
    useFrame(() => {
        const multiplier = 0.1;
        ref2.current.rotation.x += props.analogX * multiplier;
        ref2.current.rotation.y += props.analogY * multiplier;
    })


    return (
        <>
            <mesh ref={ref2} position={[-3, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshNormalMaterial attach="material" />
            </mesh>
            <mesh ref={ref} position={[1.5, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshNormalMaterial attach="material" />
            </mesh>
        </>
    );
}

const Scene = ({ rotateX, rotateY, rotateZ, analogX, analogY }: BoxProps) => {
    return (
        <Canvas>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <Box rotateX={rotateX} rotateY={rotateY} rotateZ={rotateZ} analogX={analogX} analogY={analogY} />
        </Canvas>
    );
}

export default Scene;