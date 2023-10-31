<svelte:options accessors/>
<script>
    import { createEventDispatcher, onMount } from "svelte";
    import gsap from 'gsap';
  
    export let socket;

    let dispatcher = createEventDispatcher();
    let secure = false;
    let host = 'localhost';
    let port = 8081;
    let reason;
    let error = false;
    let session_id;
    let color = (((5+Math.random())*(1<<24)|0).toString(16)).substring(0, 6);

    let auto = false;
    
    let name = "some_guy"+(~~(Math.random()*500));
    let userList = [];

    export let status = 0;
    let connectTxt;

    $: connectTxt = (status == 1) ? "disconnect" : ((status == 0) ? "connect" : "connecting...");

    // UUID hack to get around secure context https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
    function uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    onMount(() => {
        host = window.location.hostname;
        secure = window.location.protocol[4] == 's';
        session_id = uuidv4();

        window.onbeforeunload = () => {
            disconnect();
        };

        // gsap.from('#WSHeader', {y: -100, duration: 1});

        /*
        socket.addEventListener("message", (e) => {
        const dataObj = JSON.parse(e.data);
        switch(dataObj.type){
            case 'tempo':
                tempo = dataObj.obj.tempo
                break;
            default:
                console.log(dataObj.type);
                break;
            }
        });
        */
    });

    function setError(errTxt){

    }

    function disconnect(){
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
            switch(dataObj.type){
                case 'connect':
                    userList = dataObj.obj.users;
                    break;
                case 'saveState':
                    dispatcher('saveState', dataObj.obj);
                    break;
            }
            // console.log(dataObj.obj.users, userList)
            // userList = dataObj.obj;
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
            switch (e.code) {
                case 1000:
                    reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
                    break;
                case 1001:
                    reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
                    break;
                case 1002:
                    reason = "An endpoint is terminating the connection due to a protocol error";
                    break;
                case 1003:
                    reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
                    break;
                case 1004:
                    reason = "Reserved. The specific meaning might be defined in the future.";
                    break;
                case 1005:
                    reason = "No status code was actually present.";
                    break;
                case 1006:
                    reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                    break;
                case 1007:
                    reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [https://www.rfc-editor.org/rfc/rfc3629] data within a text message).";
                    break;
                case 1008:
                    reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other suitable reason, or if there is a need to hide specific details about the policy.";
                    break;
                case 1009:
                    reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
                    break;
                case 1010:
                    reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extensions, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
                    break;
                case 1011:
                    reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
                    break;
                case 1015:
                    reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                    break;
                default:
                    reason = "Unknown reason";
            }
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
        {#if status == 1 && userList.length}
            {#each userList as user}
            <div class="userList" style="background-color: {user.color}">{user.name}</div>
            {/each}
        {/if}
        {#if status == 0 || status == 2}
        <div class="labelGroup">
            <label for="auto">auto</label>
            <input name="auto" id="auto" type="checkbox" bind:checked={auto} />
        </div>
        <div class="labelGroup">
            <label for="ip">IP</label>
            <input name="ip" id="ip" type="text" bind:value={host} />
        </div>
        <div class="labelGroup">
            <label for="port">port</label>
            <input name="port" id="port" type="text" bind:value={port} />
        </div>
        <div class="labelGroup">
            <label for="name">name</label>
            <input name="name" id="name" type="text" bind:value={name} />
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
    }
    #errTxt{
        font-weight: bold;
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
  </style>
  