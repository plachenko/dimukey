<script>
  import { Piano, onKeyDown, onKeyUp } from "svelte-piano";
  import { onMount } from "svelte";
  import Timeline from "./timeline.svelte";

  let socket;
  let open = false;
  let host;
  let tl;

  $: sendNote($onKeyDown);
  $: sendNote($onKeyUp);

  let intrv;

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

  onMount(() => {
    host = window.location.hostname;
    setSocket(host);

    window.requestAnimationFrame(() => {
      console.log("testing.");
    });

    socket.addEventListener("open", (e) => {
      open = true;
    });
  });
</script>

<main>
  <input type="text" bind:value={host} />
  <div on:click={setSocket(host)}>connect</div>
  <Timeline bind:this={tl} />
  <Piano --width="900px" --height="300px" />
</main>

<style>
</style>
