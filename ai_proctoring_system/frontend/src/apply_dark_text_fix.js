import fs from 'fs';

function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            // Skip layout specifically to not ruin Navbar
            if (!file.includes('layout')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const dirs = [
    'c:/Users/JEEVANESWARAN/Downloads/exam proctoring/ai_proctoring_system/frontend/src/pages',
    'c:/Users/JEEVANESWARAN/Downloads/exam proctoring/ai_proctoring_system/frontend/src/components'
];

let allFiles = [];
dirs.forEach(d => {
    allFiles = allFiles.concat(walk(d));
});

let count = 0;

allFiles.forEach(file => {
   let content = fs.readFileSync(file, 'utf8');
   let initial = content;
   
   let r = content;
   
   const pairs = [
       ['text-brand-black', 'dark:text-white'],
       ['text-black', 'dark:text-white']
   ];
   
   for(let [light, dark] of pairs) {
       let regex = new RegExp("(?<=[\\s\"\'\])" + light + "(?=[\\s\"\'\])(?![\\s]*dark:)", "g");
       r = r.replace(regex, light + " " + dark);
   }
   
   if (r !== initial) {
      fs.writeFileSync(file, r);
      count++;
   }
});

// Also manually fix LandingPage since it's directly in pages
const landingPage = 'c:/Users/JEEVANESWARAN/Downloads/exam proctoring/ai_proctoring_system/frontend/src/pages/LandingPage.jsx';
if (fs.existsSync(landingPage)) {
    let landingContent = fs.readFileSync(landingPage, 'utf8');
    let initialLanding = landingContent;
    
    const pairs = [
       ['text-brand-black', 'dark:text-white'],
       ['text-black', 'dark:text-white']
    ];
    
    for(let [light, dark] of pairs) {
       let regex = new RegExp("(?<=[\\s\"\'\])" + light + "(?=[\\s\"\'\])(?![\\s]*dark:)", "g");
       landingContent = landingContent.replace(regex, light + " " + dark);
    }
    
    if (landingContent !== initialLanding) {
        fs.writeFileSync(landingPage, landingContent);
        if (!allFiles.includes(landingPage)) count++;
    }
}

console.log("Updated " + count + " files to fix black text.");
