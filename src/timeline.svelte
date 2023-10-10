<script>
  import { onMount } from "svelte";

  let scrubber;
  let left = 0;
  /*
    onMount(() => {
        setInterval(() => {
           scrubLeft(1);

        }, 1000);
    });
    */

  let notes = [];

  export function addNote(note) {
    note.left = left;
    left += 10;
    notes = [...notes, note];
    console.log(notes);

    scrubLeft(left);
  }

  export function scrubLeft(amt) {
    scrubber.style.left = `${left}px`;
    scrubber.scrollIntoView();
  }
</script>

<div class="timeline">
  <div bind:this={scrubber} class="scrubber" />
  {#each notes as note}
    <div style="top: {note.note}px; left: {note.left}px;" class="note" />
  {/each}
</div>

<style>
  .note {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 10px;
    height: 10px;
    background-color: #f00;
  }

  .timeline {
    width: 100%;
    height: 100px;
    background-color: #ccc;
    position: relative;
    flex: 1;
    overflow: auto;
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
