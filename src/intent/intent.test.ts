import assert from 'node:assert';
import { test } from 'node:test';
import { evaluateIntentAndConsistency } from './intent.js';
import { SceneNode } from '../types.js';

test('evaluateIntentAndConsistency detects heading hierarchy collision', () => {
  const dummySceneGraph: SceneNode = {
    id: 'node-1',
    tagName: 'body',
    selector: 'body',
    boundingBox: { x: 0, y: 0, width: 1440, height: 900 },
    visualWeight: 1,
    computedStyle: {},
    children: [
      {
        id: 'node-2',
        tagName: 'h1',
        selector: 'h1',
        boundingBox: { x: 0, y: 0, width: 100, height: 20 },
        visualWeight: 0.1,
        typography: { fontSize: '16px', fontWeight: '400', lineHeight: '20px', color: '#000', fontFamily: 'sans-serif' },
        computedStyle: {},
        children: []
      },
      {
        id: 'node-3',
        tagName: 'h2',
        selector: 'h2',
        boundingBox: { x: 0, y: 50, width: 100, height: 30 },
        visualWeight: 0.2,
        typography: { fontSize: '24px', fontWeight: '700', lineHeight: '30px', color: '#000', fontFamily: 'sans-serif' },
        computedStyle: {},
        children: []
      }
    ]
  };

  const sceneGraphs = new Map<number, SceneNode>();
  sceneGraphs.set(1440, dummySceneGraph);

  const { metrics, findings } = evaluateIntentAndConsistency(sceneGraphs, []);

  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].code, 'HIERARCHY_HEADING_COLLISION');
  assert.strictEqual(metrics.visualHierarchyScore, 80);
});
