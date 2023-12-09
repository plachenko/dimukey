<script>
    import {onMount} from 'svelte';

    let touches = [];
    let pointerDown = false;
    let radius = 100;
    let container;

    onMount(() => {
        container.addEventListener('pointermove', (e) => {
            if(pointerDown){
                touches[0].x = e.offsetX - radius/2;
                touches[0].y = e.offsetY - radius/2;
            }
        });
    });

    function pDn(e){
        pointerDown = true;
        let curTouch = {
            e,
            id: touches.length + 1,
            x: e.offsetX - radius/2,
            y: e.offsetY - radius/2
        };

        touches = [...touches, curTouch];
    }

    function pUp(e){
        pointerDown = false;
        touches = [];

    }

    function pMv(e){
        console.log('what')
        if(pointerDown){

        }
    }

    function contextMenuEvt(){

        return false;
    }

</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="touchContainer" bind:this={container}>
    <div id="touchEvtContainer" 
        on:pointerdown={pDn}
        on:pointerup={pUp}
        on:contextmenu|preventDefault={contextMenuEvt}
        />
    <div>
        {#each touches as touchEvt}
        <div class="touch" style={'left:' + touchEvt.x + 'px; top:' + touchEvt.y + 'px;'}>
            <div style="position: absolute; top: -50px; background-color:#F00; padding: 5px">
                <span>{touchEvt.id}</span>
                <span>{touchEvt.e.pointerType}</span>
            </div>
            <div class="gridbox">
                <div class="grid h"></div>
                <div class="grid v"></div>
            </div>
        </div>
        {/each}
    </div>
</div>

<style>
    .touch{
        user-select: none;
        width: 100px;
        height: 100px;
        border-radius: 100px;
        box-sizing: border-box;
        border: 5px solid;
        position: absolute;
    }
    #touchEvtContainer{
        width: 100dvw;
        height: 100dvh;
        z-index: 9999;
        position: absolute;
        }
        #touchContainer{
            width: 100dvw;
            height: 100dvh;
            z-index: 9999;
            position: absolute;
            overflow: hidden;
            }

            .gridbox{
                width: 100%;
                height: 100%;
                position: absolute;
                left: 0px;
                top: 0px;
                }
        .grid{
            position: absolute;
            }
        .v{
            border-top: 2px solid;
            width: 100%;
            left: 0px;
            }
</style>