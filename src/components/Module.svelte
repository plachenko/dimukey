<script>
    import { createEventDispatcher, onMount } from "svelte";
    
    export let modules = [];
    let moduleSelect = 0;
    const dispatch = createEventDispatcher();

    onMount(() => {
        // console.log(modules);
    })
  
    function moduleChange(){
        dispatch('moduleChange');
    }

    export function getModule(){
        return modules[moduleSelect];
    }
    
</script>
  
<div class="moduleContainer">
    <div>
        <span>Select Module</span>
        <select bind:value={moduleSelect} on:change={moduleChange}>
          {#each modules as module, idx}
          <option value={idx}>{module.name}</option>
          {/each}
        </select>
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
  