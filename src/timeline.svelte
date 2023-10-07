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

    function scrubLeft(amt){
        left += amt;
        scrubber.style.left = `${left}px`;
        scrubber.scrollIntoView();
    }

</script>

<div class="timeline">
    <div bind:this={scrubber} class="scrubber" />
</div>

<style>
    .timeline{
        width: 100%;
        height: 100px;
        background-color: #CCC;
        position: relative;
        flex: 1;
        overflow: auto;
    }

    .scrubber{
        background-color: #F00;
        width: 2px;
        height: 100%;
        position: absolute;
        left: 0px;
        top: 0px;
    }

</style>