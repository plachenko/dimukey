<script>
    import { createEventDispatcher, onMount } from "svelte";  
    import { notemodules } from '../lib/NoteModule.js';

    export let modules = [];
    let moduleSelect = 0;
    const dispatch = createEventDispatcher();
    let modNames = [];
    let modTypes = [];

    $: {
        modules = modules.filter((e) => {
            let name = ''+e.name.replace(/[^a-zA-Z]/gm,"");
            if(modTypes.indexOf(name) >= 0 || name == 'vstplugin'){
                return e;
            }
        });

        // If there's at least one module...
        if(modules.length){
            dispatch('moduleChange');
        }
    }

    onMount(() => {
        modTypes = notemodules.map(e => e.modName);
    });
  
    function moduleChange(){
        dispatch('moduleChange');
    }

    export function getModule(){
        return modules[moduleSelect];
    }
    
</script>
  
<div class="moduleContainer">
    <div>
        {#if modules.length}
            <span>Select Module</span>
            <select bind:value={moduleSelect} on:change={moduleChange}>
            {#each modules as module, idx}
            <option value={idx}>{module.name} {#if module.name.startsWith('vstplugin')}- {module.pluginId.split('-')[1]}{/if}</option>
            {/each}
            </select>
            <!--
            <div>
                {#if modules[moduleSelect].name.startsWith('vstplugin')}
                    {modules[moduleSelect].pluginId.split('-')[1]}
                {/if}
            </div>
            -->


        {/if}
    </div>
</div>
  
<style>
/*
.moduleContainer{
    width: 300px;
    height: 100%;
    background-color:#F00;
    position: absolute;
    right: 0px;
    top: 0px;
}
*/
</style>
  