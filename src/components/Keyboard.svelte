<svelte:window
    on:keydown={keyd}
    on:keyup={keyu}
/>
<svelte:options accessors/>
<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { keyboardLayouts } from "../lib/KeyLayouts";

    export let numKeys = 24;
    export let sendToSynth = false;
    let keys = [];
    let keylayoutNames = ["None", ...Object.keys(keyboardLayouts)];
    let currentLayout = 0;
    let offsetKey = 0;
    let keysDown = [];
    let pdown = false;

    const dispatcher = createEventDispatcher();

    $: {
        // if(keysDown.length)
        dispatcher('keysEvt', keysDown[keysDown.length-1]);
    }

    onMount(() => {
        let LSlayout = window.localStorage.getItem('keyLayout');
        currentLayout = LSlayout ? parseInt(LSlayout) : 0;
        setLayout();
        /*
        document.addEventListener('keydown', (e)=>{
            e.preventDefault();
            if(!currentLayout) return;
            let f = keys.find((keyObj) => {
                keyObj.label == e.key;
            });
            console.log(f);
            keys.some(e.key, () =>{

            });
            console.log();
        });
        */
    });

    function setLayout(){
        keys = [];
        let whiteKeyIdx = 0;
        let blackKeyIdx = 0;

        for(let i = 0; i <= numKeys; i++){
            const key = {
                value: i+1,
                type: true,
                note: 60+i
            };
            
            if(isWhiteKey(i)){
                key.type = false;
                if(i >= offsetKey){
                    key.label = currentLayout ? keyboardLayouts[keylayoutNames[currentLayout]][2][whiteKeyIdx+1] : '';
                    whiteKeyIdx++;
                    if(i % 12 == 5 || i % 12 == 11){
                        if(offsetKey%12 !== 5){
                            blackKeyIdx++;
                        }else{
                            if((i-offsetKey+1)%11 == 0) blackKeyIdx++;
                        }
                    }
                    
                    if(offsetKey%12 == 5){
                        if((i-offsetKey)%12 == 3) blackKeyIdx++;
                    }
                }
            } else {
                if(i >= offsetKey){
                    if(key.value - offsetKey > 1){
                        blackKeyIdx++;
                    }
                    key.label = currentLayout ? keyboardLayouts[keylayoutNames[currentLayout]][1][blackKeyIdx + 1] : '';
                }
            }

            if(key.label == "CapsLock"){
                key.label = "⇪";
            }

            if(key.label == "Enter"){
                key.label = "↩";
            }

            keys = [...keys, key];
        }
    }

    function pDn(key){
        pdown = true;
        keysDown = [...keysDown, key];
        // keysDown
    }

    function isWhiteKey(index) {
        const whiteKeys = [0, 2, 4, 5, 7, 9, 11, 12];
        return whiteKeys.includes(index % 12);
    }

    function pUp(key){
        if(keysDown.length) {
            pdown = false;
        }

        let kIdx = keysDown.findIndex(e => e.label == key.key);

        keysDown.splice(kIdx, 1);
        keysDown = [...keysDown];
    }

    function pMv(e, key){ 
        if(pdown||e.pressure > 0){
            keysDown = [key];
        }
    }

    function pLv(){
        pdown = false;
        keysDown = [];
    }

    function pEn(e){
        e.preventDefault();
        if(e.buttons == 1){
            pdown = true;
        }
    }

    function checkKey(e){
        console.log(e);
    }

    function changeLayout(){
        setLayout();
        window.localStorage.setItem('keyLayout', String(currentLayout));
    }

    function changeKeyNum(){
        setLayout();
    }

    function keyd(_e){
        if(_e.repeat) return;

        /*
        switch(_e.code){
            case 'ControlLeft':
                offsetKey--;
                setLayout();
                break;
            case 'ControlRight':
                offsetKey++;
                setLayout();
                break;
        }
        */

        let keydn = keys.find(e => e.label == _e.key);

        if(keydn) keysDown = [...keysDown, keydn];
    }

    function keyu(_e){
        let kIdx = keysDown.findIndex(e => e.label == _e.key);

        keysDown.splice(kIdx, 1);
        keysDown = [...keysDown];
        dispatcher('keyUp');
    }

    function sendToSynthEvt(){
        sendToSynth = !sendToSynth
        dispatcher('sendSynth', sendToSynth);
    }

</script>


<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="keyboardContainer">
    <div id="controls">
        <div>
            <span>Keyboard:</span>
            <select bind:value={currentLayout} on:change={changeLayout}>
                {#each keylayoutNames as layout, idx}
                <option value={idx}>{layout}</option>
                {/each}
            </select>    
        </div>
    
        <div>
            <span>Number of Keys: {numKeys + 1}</span>
            <input type="range" bind:value={numKeys} on:input={changeLayout} />
        </div>
    
        {#if currentLayout}
        <div>
            <span>Offset: {offsetKey}</span>
            <input type="range" bind:value={offsetKey} on:input={changeLayout} />  
        </div>
        {/if}
        <div style={sendToSynth ? 'background-color: #F00' : ''}>
            <input type="button" value="synth" on:click={sendToSynthEvt} />
        </div>
    </div>
    

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="keys" 
        on:pointerleave={pLv} 
        on:pointerenter={pEn} 
        on:contextmenu={(e)=>{e.preventDefault()}}>
        {#each keys as key}
            <div class={`${key.type ? "black" : "white"} ${keysDown.find((e) => e.value == key.value) ? 'current' : ''}`} 
                on:pointerdown={(e) => pDn(key)} 
                on:pointerup={(e) => pUp(key)} 
                on:pointerenter={(e) => pMv(e, key)}>
                <div class="key">
                    <span>{key.label ? key.label : ''}</span>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
#controls{
    display: flex;
    position: relative;
    z-index: 9996;
    background-color: #333;
    border-bottom: #000 2px solid;
    border-top: #000 2px solid;
    }
    #controls div{
        margin: 0px 5px;
        border-right: 2px solid #000;
        padding: 5px 15px;
        }
    #controls div:last-child{
        border: none;
    }

#keyboardContainer{
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 30%;
    box-sizing: border-box;
    user-select: none;
    background-color: #444;
    max-height: 250px;
    }
    #keys{
        height: 100%;
        flex: 1;
        display: flex;
        position: absolute;
        top: 0px;
        height: 100%;
        width: 100%;
        z-index: 0;
    }
.current .key{
    background-color:#FF0 !important;
}
.key{
    font-weight: bold;
    border-radius: 4px;
    color: #AAA;
    font-size: 1.2em;
    border: 1px solid #000;
    border-bottom: 0px;
    float:left;
    flex: 1;
    position: relative;
    padding-top: 35px;
    }
    .key span{
        position: absolute;
        bottom: 10px;
        width: 100%;
        display: inline-block;
        text-align: center;
        left: 0px;
    }

.black{
    position: relative;
    display: flex;
    }
    .black .key{
        background-color: #000;
        position: absolute;
        width: 30px;
        height: 40%;
        z-index: 9999;
        /* flex: 1 0; */
        left: -20px
        }

.white{
    flex: 1; 
    display: flex;
    }
    .white .key{ 
        background-color: #FFF;
        }
</style>