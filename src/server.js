import { WebSocketServer } from 'ws';
import * as OSC from 'node-osc';
import url from 'url';
import { watchFile, readFile } from 'fs';
import fs from 'fs';
import { notemodules } from './lib/NoteModule.js';

const client = new OSC.Client('localhost', 8082);
const wss = new WebSocketServer({port: 8081});
let connections = [];
let fileObj = null;
let currentBPM = 120;
let BSKObj;

wss.on('close', (e) => {
    console.log(e);
});

wss.on('connection', (ws, req)=>{
    ws.on('error', (err) => {
        console.log(err);
    });

    // Check URL params from the websocket URL
    let params = url.parse(req.url, {parseQueryString: true}).query;

    let addr = req.socket.remoteAddress.split(':');
    let local = false;
    const localList = [
        '192.168.1.5',
        '73.16.204.255',
        // '172.56.112.155'
    ];

    // Local connection established.
    if(addr[2] == 1 || localList.indexOf(addr[3]+'') >= 0){
        local = true;
    }

    // Check if session is already connected (HMR bug update.)
    let connected = connections.findIndex((el) => el.id == params.id);
    if(connected < 0){
        connections.push({socket: ws, user: params.user, id: params.id, color: params.color, local: local});
    } else {
        connections[connected].user = params.user;
    }

    socketSendAll(sendWSUsers());
    sendWSTempo(ws);

    // Send bespoke session file to the socket the connects.
    ws.send(fileObj.toString())

    ws.on('message', (data)=>{
        let dataObj = JSON.parse(data.toString());
        socketSendAll(JSON.stringify(dataObj));
        switch(dataObj.type){
            case 'tempo':
                currentBPM = dataObj.obj.tempo;
                sendTempo(dataObj.obj, '/bespoke/console');
                break;
            case 'note':
                sendNote(dataObj.obj, `/bespoke/module/note/${dataObj.obj.module}`);
                
                break;
            case 'disconnect':
                connections = connections.filter((e) => {
                    return e.id !== dataObj.obj.id;
                });
                
                socketSendAll(sendWSUsers());
                break;
            case 'disableToggle':
                sendDisable(dataObj.obj.module);
                break;
            case 'panic':
                sendPanic(dataObj.obj.module);
                break;
            default:
                console.log(dataObj.type);
                break;
        }
    });
});


// On Bespoke File save update output sources.
let chunkNum = 0;
let BSKsessionFile = `${process.cwd()}\\src\\assets\\session.bsk`;
readFile(BSKsessionFile, {encoding: 'utf-8'}, (err, data) => {
    const objF = str => str.match(/\x00\{(.|\n)*}�/g);
    const objStr= String(objF(data)[0]).replace(/\x00/g, '').replace(/�/g, '');
    BSKObj = JSON.parse(objStr);

    fileObj = JSON.stringify({'type': 'saveState', obj: BSKObj});
});

watchFile(BSKsessionFile, (curr, prev) => {
    let readS = fs.createReadStream(BSKsessionFile, 'utf8');
    let file = null;
    chunkNum = 0;

    readS.on('data', (chunk) => {
        chunkNum++;
       
        // if(chunkNum >= 2) return;
        if(chunk.includes('tempo')){
            // let regex = /tempo(.*?)controlseparator/;
            // let inp = String(chunk);

            // console.log(regex.exec(inp));
        }
        file += chunk;
    });

    readS.on('end', (e)=>{
        const objF = str => str.match(/\x00\{(.|\n)*}�/g);
        const objStr= String(objF(file)[0]).replace(/\x00/g, '').replace(/�/g, '');
        BSKObj = JSON.parse(objStr);
        const sendObj = {
            type: 'saveState',
            obj: BSKObj
        };

        fileObj = JSON.stringify(sendObj);
        socketSendAll(fileObj);
    });
}); 

function socketSendAll(data){
    connections.forEach(el => {
        el.socket.send(data.toString()); 
    });
}

function sendWSTempo(ws){
    let tempoObj = { 
        type: 'tempo',
        obj: {
            tempo: currentBPM
        }
    }

    ws.send(JSON.stringify(tempoObj));
}

function sendWSUsers(){
    let userInfoArray = connections.map((e) => {
        let obj = {
            name: e.user,
            id: e.id,
            color: `#${e.color}`
        };
        if(e.local) obj.local = true;

        return obj;
    });

    let connectObj = { 
        type: 'connect',
        obj: {
            users: userInfoArray
        }
    }

    return JSON.stringify(connectObj);
}

function sendTempo(obj, addr){
    const msg = new OSC.Message(addr);
    msg.append({
        type: 's',
        value: `tempo ${obj.tempo}`
    });

    client.send(msg);
}

function sendNote(obj, addr){
    const msg = new OSC.Message(addr);

    msg.append({
        type: 'f',
        value: obj.note
    });
    msg.append({
        type: 'f', 
        value: obj.vel ? obj.vel : 0
    });

    client.send(msg);
}

function sendDisable(_addr){
    const modules = (_addr == 'all') ? BSKObj.modules.map(e => e.name) : [_addr];

    modules.forEach((e) => {
        const addr = `/bespoke/module/enable/${e}`;
        const msg = new OSC.Message(addr);

        msg.append({
            type: 'f',
            value: -1
        });
        client.send(msg);
    });
}

function sendPanic(_addr){
    let modTypes = notemodules.map(e => e.modName);
    let modules = (_addr == 'all') ? BSKObj.modules.map(e => e.name) : [_addr];
    modules = modules.filter((e) => {
        let name = ''+e?.replace(/[^a-zA-Z]/gm,"");
        if(modTypes.indexOf(name) >= 0 || name == 'vstplugin'){
            return e;
        }
    });

    modules.forEach((e) => {
        const addr = `/bespoke/module/note/${e}`;

        for(let i = 0; i < 140; i++){
            const msg = new OSC.Message(addr);

            msg.append({type: 'f', value: i});
            msg.append({type: 'f', value: 0});

            client.send(msg);
        }
    });
}