<script>
  import { Piano, onKeyDown, onKeyUp } from "svelte-piano";
  import { onMount } from "svelte";

  let socket;
  let host;

  let open = false;
  $: {
    sendSocket(
      JSON.stringify({
        type: "note",
        obj: {
          note: $onKeyUp?.note,
          vel: $onKeyUp?.velocity,
        },
      })
    );
  }
  $: {
    sendSocket(
      JSON.stringify({
        type: "note",
        obj: {
          note: $onKeyDown?.note,
          vel: $onKeyDown?.velocity,
        },
      })
    );
  }
  // $: console.log($onKeyDown)

  function sendSocket(d) {
    if (open) {
      socket.send(d);
    }
  }

  onMount(() => {
    host = window.location.hostname;
    setSocket(host);
  });

  function setSocket(host) {
    socket = new WebSocket("ws://" + host + ":8081");
    socket.addEventListener("open", (e) => {
      open = true;
    });
  }
</script>

<main>
  <input type="text" bind:value={host} />
  <div on:click={setSocket(host)}>connect</div>
  <Piano --width="900px" --height="300px" />
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
