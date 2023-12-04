import fs from 'fs';

let dir = "C:\\Users\\gperc\\Documents\\repositories\\BespokeSynth\\Source";

function start(){
    let typelist = generateTypeList();
    let notelist = checkAcceptNotes();

    let flist = typelist.filter((e) => {
        if(notelist.indexOf(e.name) >= 0){
            return e;
        }
    });

    writeToFile(flist);
}
start();

function writeToFile(list){
    let file = `export let notemodules = ${JSON.stringify(list)}`;
    fs.writeFile(`${process.cwd()}\\lib\\NoteModule.js`, file, (err) => {
        console.log(err);
    });
}

function generateTypeList(){
    let list = [];

    // Find bespoke ModuleFactory directory in source...
    let modFact = `${dir}\\ModuleFactory.cpp`;

    // Add the VST plugin
    list.push({
        name: 'VSTPlugin',
        type: 'Synth',
        modName: 'vst'
    });

    // Read the file
    fs.readFileSync(modFact, 'utf-8').split(/\r?\n/).forEach((line)=>{
        // Split each file line after reading it to memory
        if(line.trim().startsWith('REGISTER(')){
            // If the line starts with the 'Register' factory method take the parameters and split them by ',' then simplify type information
            let params = line.match(/\((.*)\)/).pop().split(',');
            let type = params[2].split('_')[1];

            // Add to the module list array with type and name
            list.push({
                name: params[0],
                type,
                modName: params[1].trim()
            });
        }
    });

    return list;
}

function checkAcceptNotes(){
    let noteModules = [];

    // read through src directory...
    let files = fs.readdirSync(dir);

    files.forEach((fileName) => {
        // if the file is a header file...
        if(fileName.split('.')[1] == 'h'){
            let f = fs.readFileSync(`${dir}\\${fileName}`);
            let acceptsNotes = f.includes('static bool AcceptsNotes() { return true; }');

            if(acceptsNotes){
                let module = fileName.split('.')[0];
                noteModules.push(module);
            }
        }
    });

    return noteModules;
}
