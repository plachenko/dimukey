<script>
    import { createEventDispatcher, onMount } from "svelte";

    let midiObj;
    let curDevice = null;

    let midiSelect = 0;
    let midiInput = [];
    let useAll = false;
    let midiAllowed = false;

    let dispatcher = createEventDispatcher();

    onMount((e) => {
        if(navigator.requestMIDIAccess){
            midiAllowed = true;
            navigator.requestMIDIAccess().then(onMIDISucess, onMIDIFailure);
        }

    });
    function onMIDISucess(midiAccess){
        if(useAll){
            midiAccess.inputs.forEach((entry) => {
                entry.onmidimessage = onMIDIMessage;
            });
        }

        midiObj = midiAccess;

        listInputsAndOutputs(midiAccess);
    }

    function onMIDIFailure(msg){
      console.error(msg);
    }

    function listInputsAndOutputs(midiAccess) {
      for (const entry of midiAccess.inputs) {
        const input = entry[1];
        midiInput = [...midiInput, input.name];
      }
    }

    function changeMidi(midi){
        // console.log(midiInput);
        if(midi < 0) return;

        let idx = midi;
        if(idx < 0) return;
            let inpObj = Object.fromEntries(midiObj.inputs);
            let curInp = Object.keys(inpObj)[idx];
            Array.from(midiObj.inputs).forEach((inp) => {
            inp[1].close();
        });

        curDevice = inpObj[curInp];
        // console.log(curDevice)

        curDevice.onmidimessage = onMIDIMessage;
        // startLoggingMIDIInput(midi, idx)
    }

    function onMIDIMessage(event) {
        let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
        // console.log(event);
        for (const character of event.data) {
            str += `0x${character.toString(16)} `;
        }
        // console.log(str);
        dispatcher('sendNote', parseMidiMessage(event))
  
        // parseMidiMessage(event);
    }

    function test(e){
        // console.log('huh', e, midiSelect)
        changeMidi(midiSelect);
    }    
    function parseMidiMessage(message) {
        // console.log(message.data);
        return {
            command: message.data[0] >> 4,
            channel: message.data[0] & 0xf,
            note: message.data[1],
            velocity: message.data[2]
        }
    }

</script>
<div>
    {#if midiAllowed}
        <span>Select MIDI Device</span>
        <select bind:value={midiSelect} on:change={test}>
            <option value=-1>None</option>
            {#each midiInput as inp, idx}
            <option value={idx}>{inp}</option>
            {/each}
        </select>    
    {/if}
</div>