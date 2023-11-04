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
        
        midiAccess.onstatechange = (e) => {
            if(e.port.type == "output") return;
            midiObj = midiAccess;
            listInputsAndOutputs(midiAccess);
        }

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
        let curDevice = localStorage.getItem('curMidiDevice');
        midiInput = ['None'];
        for (const entry of midiAccess.inputs) {
            const input = entry[1];
            midiInput = [...midiInput, input.name];
        }

        if(curDevice){
            const midiIdx = midiInput.indexOf(curDevice);
            midiSelect =  midiIdx > 0 ? midiIdx : 0;
        } 
    }

    function changeMidi(midi){
        if(midi <= 0) return;
        midi--;

        let inpObj = Object.fromEntries(midiObj.inputs);
        let curInp = Object.keys(inpObj)[midi];
        
        Array.from(midiObj.inputs).forEach((inp) => {
            inp[1].close();
        });

        curDevice = inpObj[curInp];
        console.log(curDevice);
        localStorage.setItem('curMidiDevice', curDevice.name);

        curDevice.onmidimessage = onMIDIMessage;
        // startLoggingMIDIInput(midi, idx)
    }

    function onMIDIMessage(event) {
        let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
        
        for (const character of event.data) {
            str += `0x${character.toString(16)} `;
        }

        dispatcher('sendNote', parseMidiMessage(event))
  
        // parseMidiMessage(event);
    }

    function midiSelectEvt(e){
        changeMidi(midiSelect);
    }

    function parseMidiMessage(message) {
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
        <select bind:value={midiSelect} on:change={midiSelectEvt}>
            {#each midiInput as inp, idx}
            <option value={idx}>{inp}</option>
            {/each}
        </select>    
    {/if}
</div>