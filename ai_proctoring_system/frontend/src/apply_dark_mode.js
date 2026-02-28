import fs from 'fs';

function walk(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/JEEVANESWARAN/Downloads/exam proctoring/ai_proctoring_system/frontend/src/pages/dashboard');
let count = 0;

files.forEach(file => {
   let content = fs.readFileSync(file, 'utf8');
   let initial = content;
   
   // Skip files that seem to already have a lot of dark: classes to prevent messing up manually tuned ones like Navbar
   
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
       // regex to find light class NOT followed by dark class
       // e.g. bg-white(?!\s+dark:bg-gray-900)
       // actually simpler: just replace light if dark variant isn't in the same line or word? No, just simple string bounds
       // let's match the light class bounded by \b or space/quote
       let regex = new RegExp("(?<=[\\s\"\'\])" + light + "(?=[\\s\"\'\])(?![\\s]*dark:)", "g");
       r = r.replace(regex, light + " " + dark);
   }
   
   if (r !== initial) {
      fs.writeFileSync(file, r);
      count++;
   }
});
console.log("Updated " + count + " files in dashboard.");
