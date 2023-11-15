export function generateName(){
    let fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes'];

    let nameList = [
        'horse', 
        'guy',
        'gal',
        'dog',
        'cat',
        'chicken',
        'god',
        'king',
        'queen',
        'joker', 
        'birthdayBoy'
    ];
    
    let name = `${fruits[~~(Math.random() * fruits.length-1)]}${~~(Math.random()*500)}`;
   
    return name;
}

export function randomColor(){
    return (((5+Math.random())*(1<<24)|0).toString(16)).substring(0, 6);
}

// UUID hack to get around secure context https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
export function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export function checkError(code){
    let reason;
    switch (code) {
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
    return reason;
}