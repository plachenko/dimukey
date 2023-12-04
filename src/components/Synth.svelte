<svelte:options accessors/>
<script>
    import { onMount } from "svelte";

    let audioCtx;
    let speaker;
    let gainNode;
    let gainVal = 0;
    let osc;

    $: {
        if(gainNode){
            gainNode.gain.value = gainVal;
        }
    }

    onMount((e) => {
    });

    export function turnOn(){
        audioCtx =  new window.AudioContext;
        gainNode = audioCtx.createGain();
        gainVal = 0.01;
    }

    export function turnOff(){
        osc?.stop();
        gainVal = 0;
        audioCtx = null;
    }

    export function playNote(notes){
        // console.log('keyboard playing notes:', notes);
        if(notes.length == 0){
            turnOff();
            return;
        }

        // notes.forEach(())
        osc = audioCtx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(40, audioCtx.currentTime);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination)
        osc.start();
    }

</script>
<div>
    <audio bind:this={speaker}></audio>
</div>
<style>

</style>