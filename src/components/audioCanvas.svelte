<script>
    import { createEventDispatcher, onMount } from "svelte";

    let canvas;
    let ctx;

    onMount(() => {
        ctx = canvas.getContext('2d');

    });

    function pDn(){

    }

    function pUp(){

    }

    function pMv(){

    }

</script>
<div id="pointerCanvas" on:pointerdown={pDn} on:pointermove={pMv} on:pointerup={pUp}>
   
</div>
<style>
#pointerCanvas{
    background-color: #F00;
    width: 400px;
    height: 400px;
}

</style>