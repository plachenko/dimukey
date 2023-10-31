import { WebSocketServer } from 'ws';
import * as OSC from 'node-osc';
import url from 'url';
import { watchFile, readFile } from 'fs';
import fs from 'fs';

const client = new OSC.Client('localhost', 8082);
const wss = new WebSocketServer({port: 8081});
let connections = [];
let fileObj = null;

wss.on('close', (e) => {
    console.log(e);
});

wss.on('connection', (ws, req)=>{
    ws.on('error', (err) => {
        console.log(err);
    });

    let params = url.parse(req.url, {parseQueryString: true}).query;
    connections.push({socket: ws, user: params.user, id: params.id, color: params.color});

    socketSendAll(sendUsers())
    ws.send(fileObj.toString())

    ws.on('message', (data)=>{
        let dataObj = JSON.parse(data.toString());
        
        socketSendAll(JSON.stringify(dataObj));

        switch(dataObj.type){
            case 'tempo':
                sendTempo(dataObj.obj, '/bespoke/console');
                break;
            case 'note':
                sendNote(dataObj.obj, `/bespoke/module/note/${dataObj.obj.module?.name}`);
                break;
            case 'disconnect':
                connections = connections.filter((e) => {
                    return e.id !== dataObj.obj.id;
                });
                
                socketSendAll(sendUsers())
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
    const BSKObj = JSON.parse(objStr);

    fileObj = JSON.stringify({'type': 'saveState', obj: BSKObj});
});

watchFile(BSKsessionFile, (curr, prev) => {
    let readS = fs.createReadStream(BSKsessionFile, 'utf8');
    let file = null;
    chunkNum = 0;

    readS.on('data', (chunk) => {
        chunkNum++;
       
        if(chunkNum >= 2) return;
        file += chunk;
    });

    readS.on('end', (e)=>{
        const objF = str => str.match(/\x00\{(.|\n)*}�/g);
        const objStr= String(objF(file)[0]).replace(/\x00/g, '').replace(/�/g, '');
        const BSKObj = JSON.parse(objStr);
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

function sendUsers(){
    let userInfoArray = connections.map((e) => {
        return {
            name: e.user,
            id: e.id,
            color: `#${e.color}`
        }
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