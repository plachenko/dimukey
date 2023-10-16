<script>
  import { Piano, onKeyDown, onKeyUp } from "svelte-piano";
  import { onMount } from "svelte";
  import Timeline from "./timeline.svelte";
  import { slide } from "svelte/transition";

  let socket;
  let open = false;
  let host;
  let tl;
  let tempo;
  let pianoEl;  
  let options={
		polyphony: 2,
		keys: false,
		sound: false
	}

  $: sendNote($onKeyDown);
  $: sendNote($onKeyUp);
  $: sendTempo(tempo)

  let intrv;

  function sendTempo(tempo) {
    if(!tempo) return;

    const obj = {
      type: "tempo",
      obj: {
        tempo
      },
    };
    sendSocket(obj);
  }

  function sendNote(note) {
    if (!note) return;

    if (note.velocity) {
      tl.addNote(note);
    } else {
    }

    const obj = {
      type: "note",
      obj: {
        note: note.note,
        vel: note.velocity,
      },
    };

    sendSocket(obj);
  }

  function sendSocket(d) {
    socket.send(JSON.stringify(d));
  }

  function setSocket(_host) {
    socket = new WebSocket(`ws://${_host}:8081`);
  }

  let stop = false;

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

  onMount(() => {
    host = window.location.hostname;
    setSocket(host);

    document.addEventListener('keyup', (e)=>{
      console.log(e.code);
      switch(e.code){
        case 'Space':
          play();
          break;
      }
    })
      
    socket.addEventListener("message", (e)=>{
        const dataObj = JSON.parse(e.data);
        console.log('websock', dataObj);
    });

    socket.addEventListener("open", (e) => {
      open = true;

    });
  });
</script>

<main>
  <span>{tempo}</span>
  <input type="range" bind:value={tempo} min="10" max="200" />
  <input type="text" bind:value={host} />
  <div on:click={setSocket(host)}>connect</div>
  <Timeline bind:this={tl} />
  <Piano :options --width="900px" --height="300px" />
</main>

<style>
</style>
