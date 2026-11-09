import {writeDraft} from './drafts.mjs?v=3';

export function mountEditor({root,getBase,getDraft,getCollection,getSelected,apply,reorganize,showImage,closeImage}){
  const field=root.querySelector('.fw-field'),controls=root.querySelector('.fw-controls');
  const editor=document.createElement('div');editor.className='fw-editor';editor.setAttribute('aria-label','Local preview tools');
  editor.innerHTML='<button type="button" class="fw-organize">reorganize</button><button type="button" class="fw-removed" hidden>removed images</button><button type="button" class="fw-undo" hidden>undo</button>';
  controls.insertBefore(editor,controls.lastElementChild);
  const status=document.createElement('p');status.className='fw-editor-status';status.setAttribute('role','status');status.hidden=true;field.append(status);
  let timer,previous=null,busy=false;
  const report=message=>{clearTimeout(timer);status.textContent=message;status.hidden=false;timer=setTimeout(()=>status.hidden=true,4000);};
  const removedDialog=root.querySelector('.fw-removed-dialog'),noteDialog=root.querySelector('.fw-note-dialog'),noteForm=noteDialog.querySelector('form');
  const noteError=noteDialog.querySelector('[role=alert]'),removedError=removedDialog.querySelector('[role=alert]');
  const undo=editor.querySelector('.fw-undo'),removedButton=editor.querySelector('.fw-removed');
  const updateRemoved=()=>{removedButton.hidden=!getDraft().removed.length;removedButton.textContent='removed ('+getDraft().removed.length+')';};
  updateRemoved();
  async function save(next,message){
    if(busy)return false;busy=true;const before=structuredClone(getDraft());
    try{await writeDraft(next);apply(next);previous=before;undo.hidden=false;updateRemoved();report(message);return true;}
    finally{busy=false;}
  }
  for(const modal of [removedDialog,noteDialog])modal.querySelector('[data-cancel]').addEventListener('click',()=>modal.close());
  editor.querySelector('.fw-organize').addEventListener('click',async()=>{
    if(busy)return;busy=true;
    try{report(await reorganize());}catch{report('Couldn’t check the collection. Your local edits are safe.');}finally{busy=false;}
  });
  undo.addEventListener('click',async()=>{
    if(busy||!previous)return;busy=true;
    try{await writeDraft(previous);closeImage();apply(previous);previous=null;undo.hidden=true;updateRemoved();report('Last change undone.');}catch{report('Couldn’t undo. Please try again.');}finally{busy=false;}
  });
  const actions=root.querySelector('.fw-curate');actions.hidden=false;
  actions.querySelector('[data-remove]').addEventListener('click',async()=>{
    const selected=getSelected();if(!selected||busy)return;
    const next=structuredClone(getDraft());next.removed.push(selected.id);
    try{if(await save(next,'Image removed. Use undo to bring it back.'))closeImage();}catch{report('Couldn’t save the removal. Please try again.');}
  });
  actions.querySelector('[data-edit-note]').addEventListener('click',()=>{
    const selected=getSelected();if(!selected)return;
    noteForm.elements.note.value=selected.noteAuthor==='user'?selected.note||'':'';noteError.hidden=true;noteDialog.showModal();
  });
  noteForm.addEventListener('submit',async event=>{
    event.preventDefault();const selected=getSelected();if(!selected||busy)return;
    const next=structuredClone(getDraft());next.notes[selected.id]=noteForm.elements.note.value;
    try{if(await save(next,'Your note is saved locally.')){noteDialog.close();showImage(selected.id);}}catch{noteError.textContent='Couldn’t save your note. Please try again.';noteError.hidden=false;}
  });
  function showRemoved(){
    const list=removedDialog.querySelector('.fw-removed-list');list.replaceChildren();removedError.hidden=true;
    const all=[...getBase().items,...getDraft().added];
    for(const id of getDraft().removed){
      const ref=all.find(ref=>ref.id===id);if(!ref)continue;
      const row=document.createElement('div'),image=document.createElement('img'),name=document.createElement('span'),restore=document.createElement('button');
      image.src=ref.thumbnail||ref.src;image.alt='';name.textContent=ref.name;restore.type='button';restore.textContent='restore';restore.setAttribute('aria-label','Restore '+ref.name);
      restore.addEventListener('click',async()=>{
        const next=structuredClone(getDraft());next.removed=next.removed.filter(other=>other!==id);
        try{if(await save(next,'Image restored.')){if(next.removed.length)showRemoved();else removedDialog.close();}}catch{removedError.textContent='Couldn’t restore this image. Please try again.';removedError.hidden=false;}
      });
      row.append(image,name,restore);list.append(row);
    }
  }
  removedButton.addEventListener('click',()=>{showRemoved();removedDialog.showModal();});
  return {report};
}
