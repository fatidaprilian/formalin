"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = require("node:test");
const intent_js_1 = require("./intent.js");
(0, node_test_1.test)('evaluateIntentAndConsistency detects heading hierarchy collision', () => {
    const dummySceneGraph = {
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
    const sceneGraphs = new Map();
    sceneGraphs.set(1440, dummySceneGraph);
    const { metrics, findings } = (0, intent_js_1.evaluateIntentAndConsistency)(sceneGraphs, []);
    node_assert_1.default.strictEqual(findings.length, 1);
    node_assert_1.default.strictEqual(findings[0].code, 'HIERARCHY_HEADING_COLLISION');
    node_assert_1.default.strictEqual(metrics.visualHierarchyScore, 80);
});
