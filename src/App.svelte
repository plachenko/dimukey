<script>
  import MidiParser from "midi-parser-js";
  import { onMount } from "svelte";
  import { userstate } from "./userstate";
  import Timeline from "./components/Timeline.svelte";
  import WSConnect from "./components/WSConnect.svelte";
  import Midi from './components/Midi.svelte';
  import AudioCanvas from "./components/audioCanvas.svelte";
  import Module from './components/Module.svelte';
  import Keyboard from "./components/Keyboard.svelte";
  import Synth from "./components/Synth.svelte";
  import TouchComponent from "./components/TouchComponent.svelte";


  let tl;
  let tempo = 120;
  let stop = false;
  let swing = .5;
  let kb;
  let internalSynth;

  let WSConnection;

  let modules = []
  let moduleSelect = 0;
  let fr;

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
  function sendPanic(_module = 'all'){
    if(!_module) return;
    console.log('sending', _module);
    notesDown = [];

    const obj = {
      type: "panic",
      obj: {
        module: _module
      },
    };

    sendSocket(obj);
  }

  function sendDisableToggle(_module = 'all'){
    const obj = {
      type: "disableToggle",
      obj: {
        module: _module
      },
    };

    sendSocket(obj);
  }

  function sendNote(note) {
    if (!note) return;

    note = note.detail ? note.detail : note;
    console.log('got note', note);

    let noteIdx = notesDown.indexOf(note.note);

    if(noteIdx >= 0){
      notesDown.splice(noteIdx, 1);
      note.velocity = 0;
    }else {
      notesDown = [...notesDown, note.note];
    }

    if (note.velocity) {
      tl.addNote(note);
    }

    if(kb.sendToSynth){
      // console.log(kb.sendToSynth, notesDown)
      // internalSynth.playNote(notesDown);
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

  function sendReset(e){
    const obj = {
      type: "reset"
    };
    sendSocket(obj);
  }

  function moduleChange(e){
    console.log(modules[moduleSelect]);
  }

  onMount(() => {
    //TEMP:
    WSConnection.connect();

    MidiParser.parse(fr, (obj) => {
      console.log(obj);
    });

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
  
  function dropEvt(e){
    e.preventDefault();
    e.stopPropagation();
  }

  function sendSynth(){
    // console.log(kb.sendToSynth);
    if(kb.sendToSynth){
      internalSynth.turnOn();
    } else {
      internalSynth.turnOff();
    }
  }
</script>

<main>
  <!-- <TouchComponent /> -->

  <WSConnect 
    on:tempo={(e) => tempo = e.detail} 
    on:saveState={saveState} 
    bind:this={WSConnection} 
    />
  <span>BPM: 
    <input id="bpminp" type="number" on:change={sendTempo} bind:value={tempo} />
  </span>
  <input type="range" on:mouseup={sendTempo} bind:value={tempo} min="10" max="200" />
  
  <span>Swing: {swing}</span>
  <input type="range" on:mouseup={sendSwing} bind:value={swing} min=".5" max="1" />
  
  <Midi on:sendNote={(e) => kb.midiNote(e)} />

  <input bind:this={fr} type="file" />
  
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

  <input type="submit" value="panic" on:click={(e) => sendPanic()}>
  <input type="submit" value="reset" on:click={(e) => sendReset()}>

  <input type="submit" value="disable" on:click={(e) => sendDisableToggle()}>
  <!-- <input type="text" bind:value={host} /> -->
  <!-- <div id="connect" on:click={setSocket(host)}>connect</div> -->
  {#each Array(3) as row, key}
  <Timeline 
    {modules} 
    bind:this={tl}
    on:sendPanic={(e) => sendPanic(e.detail)}
    on:click={e => selectRow(key)} />
  {/each}

  <Keyboard 
    bind:this={kb} 
    on:keysEvt={sendNote} 
    on:sendSynth={sendSynth}
    on:keyUp={sendNote} />

  <Synth bind:this={internalSynth} />
</main>

<style>
  #bpminp{
    width: 40px;
  }
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
