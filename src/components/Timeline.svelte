<svelte:options accessors />

<script>
  import { createEventDispatcher, onMount } from "svelte";
  import Module from './Module.svelte'

  const dispatch = createEventDispatcher();

  let scrubber;
  let left = 0;
  let moduleCont;
  export let moduleName = null;
  
  export let modules = [];
  /*
  onMount(() => {
      setInterval(() => {
          scrubLeft(1);

      }, 1000);
  });
  */

  let notes = [];

  onMount(() => {
    // console.log(modules);
    // moduleChange();
  })

  export function addNote(note) {
    note.left = left;
    left += 10;
    note.top = 10 * (note.note % 12)
    notes = [...notes, note];
  

    // dispatch('noteAdded', {note: note, module: moduleName});

    scrubLeft(left);
  }

  function moduleChange(e){
    dispatch('sendPanic', moduleName);
    moduleName = moduleCont.getModule().name;
  }

  export function setPosition(amt){
    left = amt;
    scrubber.style.left = amt;
    // scrubber.scrollIntoView();
  }

  function clearNotes(){
    notes = [];
    scrubLeft(0);
  }

  function sendPanic(){
    dispatch('sendPanic', moduleName);
  }

  export function scrubLeft(amt) {
    left = amt;
    scrubber.style.left = `${left}px`;
    // scrubber.scrollIntoView();
  }
</script>

<div class="timeline">
  <div>
    {#each new Array(12) as row}
      <div class="row" />
    {/each}
  </div>
  <div bind:this={scrubber} class="scrubber" />
  {#each notes as note}
    <div style="top: {note.top}px; left: {note.left}px;" class="note" />
  {/each}
  <div class="moduleContainer">
    <Module 
      on:moduleChange={moduleChange} 
      bind:this={moduleCont} 
      {modules} />
    <input type="button" value="clear" on:click={clearNotes} />
    <input type="button" value="panic" on:click={sendPanic} />
  </div>
</div>

<style>
  .moduleContainer{
    width: 300px;
    height: 100%;
    background-color:#F00;
    position: absolute;
    right: 0px;
    top: 0px;
  }
  .note {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 10px;
    height: 10px;
    background-color: #f00;
  }

  .row{
    height: 10px;
    width: 100%;
    /* background-color:#F00; */
    border-top: #000 2px solid;
    box-sizing: border-box;
    position: relative;
  }
  .timeline {
    margin: 4px 0px;
    width: 100%;
    height: 100px;
    background-color: #ccc;
    position: relative;
    /* background: repeating-linear-gradient(#FFF, #FFF 10px, #000000 11px, #000000 12px); */
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .scrubber {
    background-color: #f00;
    width: 2px;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
  }
</style>
