<script>
  import { Piano, onKeyDown, onKeyUp} from 'svelte-piano';
  import { onMount } from "svelte";
  import Timeline from './timeline.svelte';

  let socket;
  let open = false;
  let host;

  $: sendNote($onKeyDown)
  $: sendNote($onKeyUp)

  function sendNote(note){
    if(!note) return;

    const obj = {
      type: 'note',
      obj: {
        note: note.note,
        vel: note.velocity
      }
    }
    sendSocket(obj);
  }
  
  function sendSocket(d){
      socket.send(JSON.stringify(d));
  }

  function setSocket(_host){
    socket = new WebSocket(`ws://${_host}:8081`);
  }

  onMount(() => {
    host = window.location.hostname;
    setSocket(host);
    socket.addEventListener('open', (e) => {
      open = true;
    });
  });
  function tits(f){
    console.log(f);
  }
</script>

<main>
  <input type="text" bind:value={host} />
  <div on:click={setSocket(host)}>connect</div>
  <Timeline  />
  <Piano on:onmousedown={() => tits('hi')} --width="900px" --height="300px" />
</main>

<style>

</style>
