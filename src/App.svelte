<script>
  import { Piano, onKeyDown, onKeyUp } from "svelte-piano";
  import { onMount } from "svelte";
  import Timeline from "./components/Timeline.svelte";
  import WSConnect from "./components/WSConnect.svelte";
  import Midi from './components/Midi.svelte';
  import Module from './components/Module.svelte';

  import { userstate } from "./userstate";

  let tl;
  let tempo = 120;
  let stop = false;
  let swing = .5;

  let WSConnection;

  let modules = []
  let moduleSelect = 0;

  $: sendNote($onKeyDown);
  $: sendNote($onKeyUp);

  function sendSwing() {
    console.log('sending');
  }

  function sendTempo() {
    if(!tempo) return;

    const obj = {
      type: "tempo",
      obj: {
        tempo
      },
    };
    sendSocket(obj);
  }

  let notesDown = [];

  function sendPanic(){
    const obj = {
      type: "panic",
      obj: {
        module: modules[moduleSelect]
      },
    };
    sendSocket(obj);
  }

  function sendNote(note) {
    if (!note) return;

    note = note.detail ? note.detail : note;

    let noteIdx = notesDown.indexOf(note.note);
    // console.log(noteIdx);

    if(noteIdx >= 0 || note.velocity == 0){
      notesDown.splice(noteIdx, 1);
      note.velocity = 0;
    }else {
      notesDown = [...notesDown, note.note];
    }

    // if(noteIdx >= 0){
      // notesDown = noteIdx >= 0 ? [...notesDown, note.note] : notesDown.splice(notesDown.findIndex(e => e,1)), 1;
    // }
    // console.log(notesDown);

    if (note.velocity) {
      tl.addNote(note);
    }

    const obj = {
      type: "note",
      obj: {
        note: note.note,
        vel: note.velocity,
        module: tl.moduleName
      },
    };

    sendSocket(obj);
  }

  function sendSocket(d) {
    if(WSConnection.status != 1) return;
    WSConnection.socket.send(JSON.stringify(d));
  }

  function play(){
    tl.setPosition(0);
    window.requestAnimationFrame(loop);
  }

  function loop(){
    tl.scrubLeft(1);
    if(!stop){
      window.requestAnimationFrame(loop);
    }
  }

  function test(e){
    console.log(e.detail);
  }

  function saveState(e){
    modules = e.detail.modules;
  }

  function selectRow(idx){
    // tl = 
    // console.log(idx);
  }

  function moduleChange(e){
    console.log(modules[moduleSelect]);
  }

  onMount(() => {
    //TEMP:
    WSConnection.connect();

    // modules = [...modules];

    /*
    document.addEventListener('keyup', (e)=>{
      console.log(e.code);
      switch(e.code){
        case 'Space':
          play();
          break;
      }
    })
    */
  });
  
</script>

<main>
  <WSConnect on:tempo={(e) => tempo = e.detail} on:saveState={saveState} bind:this={WSConnection} />
  <span>BPM: {tempo}</span>
  <input type="range" on:mouseup={sendTempo} bind:value={tempo} min="10" max="200" />
  <span>Swing: {swing}</span>
  <input type="range" on:mouseup={sendSwing} bind:value={swing} min=".5" max="1" />
  
  <Midi on:sendNote={(e) => sendNote(e)} />
  <!--
  <div>
     <span>Select Module</span>
     <select bind:value={moduleSelect} on:change={moduleChange}>
       {#each modules as module, idx}
       <option value={idx}>{module.name}</option>
       {/each}
     </select>
  </div>     
  -->

  <!-- <input type="submit" value="panic" on:click={sendPanic}> -->
  <!-- <input type="text" bind:value={host} /> -->
  <!-- <div id="connect" on:click={setSocket(host)}>connect</div> -->
  {#each Array(3) as row, key}
  <Timeline {modules} bind:this={tl} on:click={e => selectRow(key)} />
  {/each}
  <Piano --width="900px" --height="300px" />
</main>

<style>
  #connect {
    cursor: pointer;
    user-select: none;
    padding: 10px;
    border: 1px solid;
    background-color: #0F0;
    margin: 0px auto;
    width: 100px;
  }
</style>
