import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { type } from '@testing-library/user-event/dist/type';
 
const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'root' } },
  { id: 'n2', position: { x: -100, y: 100 }, data: { label: 'test.py' } },
  { id: 'n3', position: { x: 100, y: 100 }, data: { label: 'app.js' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2', type: 'step'}, { id: 'n1-n3', source: 'n1', target: 'n3', type: 'step'}];
 
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
 
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}