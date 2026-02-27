import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { getStoreSection } from './LiveVisitorDashboard';

interface VisitorSession {
  session_id: string;
  current_page: string;
  cart_items: any[];
  cart_total: number;
  is_in_checkout: boolean;
  user_email: string | null;
  country: string | null;
}

interface StoreVisualizationProps {
  sessions: VisitorSession[];
}

// Store layout: section name → 3D position
const SECTION_POSITIONS: Record<string, [number, number, number]> = {
  'entrance': [0, 0, 8],
  'shop': [0, 0, 0],
  'bestsellers': [-4, 0, -2],
  'cashier': [6, 0, -6],
  'brand-mancera': [-6, 0, 2],
  'brand-valentino': [-6, 0, -2],
  'brand-versace': [-2, 0, 4],
  'brand-jean-paul-gaultier': [2, 0, 4],
  'brand-giorgio-armani': [4, 0, 2],
  'brand-ysl': [4, 0, -2],
  'brand-dior': [-2, 0, -4],
  'brand-tom-ford': [2, 0, -4],
  'brand-creed': [-4, 0, 4],
  'brand-parfums-de-marly': [6, 0, 0],
  'brand-xerjoff': [6, 0, 4],
  'brand-louis-vuitton': [-6, 0, -6],
  'brand-viktor---rolf': [0, 0, -6],
  'brand-azzaro': [2, 0, -6],
  'brand-lattafa': [-4, 0, -6],
};

function getSectionPosition(section: string): [number, number, number] {
  if (SECTION_POSITIONS[section]) return SECTION_POSITIONS[section];
  // Unknown brand → random-ish spot in the store
  const hash = section.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [(hash % 10) - 5, 0, (hash % 8) - 4];
}

// Shelf component
function Shelf({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      {/* Shelf base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1, 0.6]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Shelf top */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.8, 0.1, 0.7]} />
        <meshStandardMaterial color="#A0926B" />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.22}
        color="#333333"
        anchorX="center"
        anchorY="bottom"
        maxWidth={2}
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

// Character that walks to its target
function Character({ 
  session, 
  targetPosition,
}: { 
  session: VisitorSession; 
  targetPosition: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(...targetPosition));
  const target = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);
  const hasCart = session.cart_items && session.cart_items.length > 0;
  const isCheckout = session.is_in_checkout;
  const bodyColor = hasCart ? '#22c55e' : '#ef4444';
  
  // Walking animation
  const [bobPhase, setBobPhase] = useState(0);
  const isMoving = useRef(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const dist = currentPos.current.distanceTo(target);
    isMoving.current = dist > 0.1;
    
    if (isMoving.current) {
      currentPos.current.lerp(target, Math.min(delta * 2, 1));
      setBobPhase(p => p + delta * 8);
    }
    
    groupRef.current.position.copy(currentPos.current);
    groupRef.current.position.y = isMoving.current ? Math.abs(Math.sin(bobPhase)) * 0.1 : 0;
    
    // Face movement direction
    if (isMoving.current) {
      const dir = target.clone().sub(currentPos.current).normalize();
      if (dir.length() > 0.01) {
        groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body (cuboid) */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head (cube) */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color="#FFD5B8" />
      </mesh>
      {/* Cart indicator - small floating bag */}
      {hasCart && (
        <mesh position={[0.25, 0.4, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.1]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}
      {/* Email label or country */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.12}
        color={isCheckout ? '#d97706' : '#666666'}
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {session.user_email ? session.user_email.split('@')[0] : (session.country || 'visitor')}
      </Text>
      {/* Cart total if has cart */}
      {hasCart && (
        <Text
          position={[0, 1.15, 0]}
          fontSize={0.1}
          color="#22c55e"
          anchorX="center"
          anchorY="bottom"
          font={undefined}
        >
          {`€${(session.cart_total || 0).toFixed(0)}`}
        </Text>
      )}
    </group>
  );
}

// Cashier desk
function CashierDesk() {
  const pos = SECTION_POSITIONS['cashier'];
  return (
    <group position={pos}>
      {/* Desk */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2, 0.8, 0.8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Register */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 1.15, -0.1]}>
        <boxGeometry args={[0.4, 0.25, 0.05]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.3} />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.25}
        color="#d97706"
        anchorX="center"
        font={undefined}
      >
        CASHIER
      </Text>
    </group>
  );
}

// Floor
function StoreFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#f5f0e8" />
    </mesh>
  );
}

// Walls
function StoreWalls() {
  return (
    <>
      {/* Back wall */}
      <mesh position={[0, 2, -9]}>
        <boxGeometry args={[20, 4, 0.2]} />
        <meshStandardMaterial color="#e8e0d4" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-9, 2, 0]}>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#e8e0d4" />
      </mesh>
      {/* Right wall */}
      <mesh position={[9, 2, 0]}>
        <boxGeometry args={[0.2, 4, 20]} />
        <meshStandardMaterial color="#e8e0d4" />
      </mesh>
      {/* Store sign */}
      <Text
        position={[0, 3.2, -8.8]}
        fontSize={0.5}
        color="#1a1a1a"
        anchorX="center"
        font={undefined}
      >
        PROFPARFUMS
      </Text>
      {/* Entrance */}
      <Text
        position={[0, 0.3, 9.5]}
        fontSize={0.3}
        color="#888"
        anchorX="center"
        rotation={[-Math.PI / 2, 0, 0]}
        font={undefined}
      >
        ▼ ENTRANCE ▼
      </Text>
    </>
  );
}

function StoreScene({ sessions }: { sessions: VisitorSession[] }) {
  // Build shelf list from known sections
  const shelfLabels: Record<string, string> = {
    'bestsellers': '⭐ Best Sellers',
    'shop': 'All Products',
    'brand-mancera': 'Mancera',
    'brand-valentino': 'Valentino',
    'brand-versace': 'Versace',
    'brand-jean-paul-gaultier': 'JPG',
    'brand-giorgio-armani': 'Armani',
    'brand-ysl': 'YSL',
    'brand-dior': 'Dior',
    'brand-tom-ford': 'Tom Ford',
    'brand-creed': 'Creed',
    'brand-parfums-de-marly': 'PDM',
    'brand-xerjoff': 'Xerjoff',
    'brand-louis-vuitton': 'LV',
    'brand-viktor---rolf': 'V&R',
    'brand-azzaro': 'Azzaro',
    'brand-lattafa': 'Lattafa',
  };

  const shelves = Object.entries(shelfLabels).map(([key, label]) => ({
    position: getSectionPosition(key),
    label,
  }));

  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={50} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.1} 
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={25}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.3} />

      <StoreFloor />
      <StoreWalls />
      <CashierDesk />
      
      {/* Shelves */}
      {shelves.map(({ position, label }) => (
        <Shelf key={label} position={position} label={label} />
      ))}

      {/* Visitors */}
      {sessions.map(session => {
        const section = getStoreSection(session.current_page);
        const basePos = getSectionPosition(section);
        // Offset slightly so characters don't overlap
        const hash = session.session_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const offset: [number, number, number] = [
          basePos[0] + ((hash % 5) - 2) * 0.5,
          0,
          basePos[2] + ((hash % 7) - 3) * 0.4,
        ];
        return (
          <Character
            key={session.session_id}
            session={session}
            targetPosition={offset}
          />
        );
      })}
    </>
  );
}

export default function StoreVisualization({ sessions }: StoreVisualizationProps) {
  return (
    <Canvas shadows style={{ background: '#faf8f5' }}>
      <StoreScene sessions={sessions} />
    </Canvas>
  );
}
