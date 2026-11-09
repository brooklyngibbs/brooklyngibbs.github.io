import test from 'node:test';
import assert from 'node:assert/strict';
import {worldScale,zoomFromScale,photoScale,photoDimensions} from './camera.mjs';

test('zoom grows readable images and their spacing together without a tiny-size ceiling',()=>{
  const sample={size:66,w:600,h:800};
  for(const mobile of [false,true]){
    const image=photoDimensions(sample,false,mobile);
    const edge=Math.max(image.w,image.h);
    assert.ok(edge*photoScale(1)>=50&&edge*photoScale(1)<=60,'Browsing scale supports many images at once');
    assert.ok(edge*photoScale(8)>175,'Deeper zoom makes the actual reference readable');
    assert.ok(edge*photoScale(24)>350,'Close inspection remains possible on the canvas');
    for(const z of [.1,.5,1,3.2,4.85,6.5,12,24])assert.equal(photoScale(z),worldScale(z),'Images and gaps grow in the same proportion');
  }
});

test('wheel anchors, branch framing and pinch gestures share an exact inverse scale',()=>{
  for(const z of [.0001,.01,.1,.5,1,3.2,4.85,8,24,60]){
    assert.ok(Math.abs(zoomFromScale(worldScale(z))-z)<1e-9);
    assert.ok(worldScale(z*1.4)>worldScale(z),'Each zoom step still moves smoothly forward');
  }
});

test('large opening covers ease to a limit while small detail photos remain inspectable',()=>{
  const cover={edge:480,level:0},detail={edge:30,level:3};
  assert.ok(photoScale(48,cover)*cover.edge<=320);
  assert.ok(photoScale(48,detail)*detail.edge>300);
  for(const p of [cover,detail]){
    const start=zoomFromScale((p.level===0?220:360)/p.edge);
    const before=photoScale(start-.0001,p)*p.edge,after=photoScale(start+.0001,p)*p.edge;
    assert.ok(after>=before&&after-before<.1);
  }
});
