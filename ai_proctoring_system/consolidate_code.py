import os

files_to_include = []
exclude = ['node_modules', 'dist', '.venv', 'brain', '.gemini', '__pycache__', '.git']
extensions = ('.js', '.jsx', '.py', '.sql', '.css', '.md')

root_dir = r'c:\Users\JEEVANESWARAN\Downloads\exam proctoring\ai_proctoring_system'
output_file = os.path.join(root_dir, 'AI_Proctoring_System_Codebase.md')

with open(output_file, 'w', encoding='utf-8') as outfile:
    outfile.write("# AI Proctoring System - Full Codebase Documentation\n\n")
    for root, dirs, files in os.walk(root_dir):
        # In-place modification of dirs to skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude]
        for name in files:
            if name.endswith(extensions) and name != 'AI_Proctoring_System_Codebase.md' and name != 'consolidate_code.py':
                path = os.path.join(root, name)
                outfile.write(f"### File: {path}\n")
                ext = os.path.splitext(name)[1].replace('.', '')
                outfile.write(f"```{ext}\n")
                try:
                    with open(path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"// Error reading file: {e}\n")
                outfile.write("\n```\n\n")

print(f"Documentation generated at {output_file}")
