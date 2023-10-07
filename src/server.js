import { WebSocketServer } from 'ws';
import * as OSC from 'node-osc';

const client = new OSC.Client('localhost', 8082);

const wss = new WebSocketServer({port: 8081});
wss.on('connection', (ws)=>{
    ws.on('error', (err) => {
        console.log(err);
    });
    ws.on('message', (data)=>{
        let obj = JSON.parse(data.toString());
        console.log(obj);
        const msg = new OSC.Message('/bespoke/note');
        if(obj.type == "note"){
            msg.append({
                type: 'f',
                value: obj.obj.note
            });
            msg.append({
                type: 'f', 
                value: obj.obj.vel
            });

            console.log(msg);
            client.send(msg);
        }
    });
})