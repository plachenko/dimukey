<svelte:options accessors/>
<script>
    import { createEventDispatcher, onMount, afterUpdate } from "svelte";
    import gsap from 'gsap';
    import { userstate } from "../userstate";
    import * as WSUtils from '../lib/WSUtils';
  
    export let socket = null;

    let dispatcher = createEventDispatcher();
    let secure = false;
    let host = 'localhost';
    let port = 8081;
    let reason;
    let error = false;
    let session_id;
    let color = WSUtils.randomColor();
    let auto = false;
    let userList = [];
    let name = WSUtils.generateName();

    export let status = 0;
    let connectTxt;
    let filteredUsers = [];

    $: connectTxt = (status == 1) ? "disconnect" : ((status == 0) ? "connect" : "connecting...");
    // $: filteredUsers = $userstate.socket.users;

    onMount(() => {
        host = window.location.hostname;
        secure = window.location.protocol[4] == 's';


        // Store session id if HMR to prevent user duplication
        if(!$userstate.socket.id){
            session_id = WSUtils.uuidv4();
            $userstate.socket.id = session_id;
        }else{
            session_id = $userstate.socket.id;
        }

        let session_idx = $userstate.socket.users.findIndex((e) =>  e.id == session_id);
        // console.log($userstate.socket.users.unshift($userstate.socket.users[session_idx]));
        $userstate.socket.users.unshift($userstate.socket.users[session_idx])
        window.onbeforeunload = () => {
            disconnect();
        };

        /*
        socket.addEventListener("message", (e) => {
            const dataObj = JSON.parse(e.data);
            switch(dataObj.type){
                case 'tempo':
                    break;
                default:
                    console.log(dataObj.type);
                    break;
            }
        });
        */
    });

    export function disconnect(){
        const obj = {
            type: "disconnect",
            obj: {
                id: session_id
            },
        };
        socket.send(JSON.stringify(obj));
    }

    export function connect(){
        if(status == 1){
            disconnect();
            socket.close();
            socket = null;
            status = 0;
            return;
        }

        status = 2;

        socket = new WebSocket(`${secure ? 'wss' : 'ws'}://${host}:${port}/?user=${name}&id=${session_id}&color=${color}`);
        socket.addEventListener('open', (e) => {
            status = 1;
        });

        socket.addEventListener('message', (e) => {
            let dataObj = JSON.parse(e.data);
            switch(dataObj.type) {
                case 'connect':
                    userList = dataObj.obj.users;
                    $userstate.socket.users = dataObj.obj.users;
                    break;
                case 'saveState':
                    dispatcher('saveState', dataObj.obj);
                    break;
                case 'tempo':
                    dispatcher('tempo', dataObj.obj.tempo);
                    break;

            }
        });
        
        socket.addEventListener('error', (e) => {
            status = 0;
            error = true;
            setTimeout((e) => {
                error = false;
            }, 10000);
        });

        socket.addEventListener('close', (e)=>{
            status = 0;
            reason = WSUtils.checkError(e.code);
        });
    }
  </script>
  
  <div id="WSHeader">
    {#if error}
        <div id="error"><span id="errTxt">Error Connecting</span>{#if reason}: {/if}
        {#if reason}
            <span>{reason}</span>
        {/if}
        </div>
    {/if}
    <form on:submit|preventDefault={connect}>

        {#if status == 1 && $userstate.socket.users.length}
            {#each userList as user}
            <div class="userList {session_id == user.id ? 'current' : '' } {user.local ? 'local' : ''}" style="background-color: {user.color}">{user.name}</div>
            {/each}
        {/if}

        {#if status == 0 || status == 2}
        <div class="labelGroup">
            <label for="auto">auto</label>
            <input name="auto" id="auto" type="checkbox" bind:checked={auto} />
        </div>
        <div class="labelGroup">
            <label for="ip">IP</label>
            <input on:focus={e => e.target.select()} name="ip" id="ip" type="text" bind:value={host} />
        </div>
        <div class="labelGroup">
            <label for="port">port</label>
            <input on:focus={e => e.target.select()} name="port" id="port" type="text" bind:value={port} />
        </div>
        <div class="labelGroup">
            <label for="name">name</label>
            <input on:focus={e => e.target.select()} name="name" id="name" type="text" bind:value={name} />
        </div>
        <!--
        <div class="labelGroup">
            <input name="color" id="color" type="color" bind:value={color} />
        </div>
        -->
        {/if}
        
        <input type="submit" bind:value="{connectTxt}" />
    </form>
  </div>
  
  <style>
    .userList{
        float: left;
        margin: 0px 3px;
        padding: 5px;
        box-sizing: border-box;
        border: 4px solid #F00;
        user-select: none;
    }
    #errTxt{
        font-weight: bold;
    }

    .local{
        border-color: #0F0;
    }
    #WSHeader{
        color: #FFF;
        width: 100%;
        background-color: rgb(80, 80, 80);
        border-bottom: 2px solid;
        padding: 5px;
        float: left;
        text-align: left;
        box-sizing: border-box;
        }
        
    label {
        /* display: block; */
        }
    
        input[type=text]{
            /* display: block; */
            width: 100px;
            padding: 4px;
            }

        input[type=submit]{
            float: right;
            margin-right: 30px;
            width: 100px;
            padding: 5px 0px;
            }
    
    .labelGroup{
        margin: 0px 6px;
        float: left;
        }
        #error{
            text-align: center;
            background-color:#F00;
            padding: 5px;
            margin-bottom: 10px;
            border-radius: 5px;
        }
        .current{
            border-color: #FFF;
            font-weight: bold;
        }
  </style>
  