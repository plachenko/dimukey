import { WebSocketServer } from 'ws';
import * as OSC from 'node-osc';

const client = new OSC.Client('localhost', 8082);
const wss = new WebSocketServer({port: 8081});
const connections = [];
wss.on('connection', (ws)=>{
    ws.on('error', (err) => {
        console.log(err);
    });

    connections.push(ws);

    ws.on('message', (data)=>{
        let dataObj = JSON.parse(data.toString());
        
        connections.forEach(el => {
            el.send(data); 
        });

        switch(dataObj.type){
            case 'tempo':
                sendTempo(dataObj.obj, '/bespoke/console');
                break;
            case 'note':
                sendNote(dataObj.obj, '/bespoke/note');
                break;
            default:
                console.log(dataObj.type);
                break;
        }
    });
});

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
        value: obj.vel
    });

    client.send(msg);
}