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
       ['bg-white', 'dark:bg-gray-900'],
       ['bg-gray-50', 'dark:bg-gray-950'],
       ['bg-gray-100', 'dark:bg-gray-800'],
       ['text-gray-900', 'dark:text-white'],
       ['text-gray-800', 'dark:text-gray-100'],
       ['text-gray-600', 'dark:text-gray-300'],
       ['text-gray-500', 'dark:text-gray-400'],
       ['border-gray-100', 'dark:border-gray-800'],
       ['border-gray-200', 'dark:border-gray-700']
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
console.log("Updated " + count + " files across frontend.");
