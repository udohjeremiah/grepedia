import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEARCH_DIRS = ["apps", "packages"];
const PROMPT_EXTENSIONS = [".md", ".txt"];

const findDirectories = (dir: string) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name));
};

const findEnvFile = (projectDir: string) => {
  const files = fs.existsSync(projectDir) ? fs.readdirSync(projectDir) : [];

  const localEnv = files.find(
    (file) => file === ".env.local" || /^\.env\.[^.]+\.local$/.test(file),
  );

  if (localEnv) {
    return path.join(projectDir, localEnv);
  }

  if (files.includes(".env")) {
    return path.join(projectDir, ".env");
  }

  return path.join(projectDir, ".env.local");
};

const updateEnvFile = (envPath: string, envKey: string, envValue: string) => {
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const line = `${envKey}=${envValue}`;

  const regex = new RegExp(`^${envKey}=.*$`, "m");

  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, line);
  } else {
    envContent += `\n${line}\n`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n");
};

const processProject = (projectDir: string) => {
  const promptsDir = path.join(projectDir, ".prompts");

  if (!fs.existsSync(promptsDir)) {
    return;
  }

  const envPath = findEnvFile(projectDir);

  const promptFiles = fs
    .readdirSync(promptsDir)
    .filter((file) => PROMPT_EXTENSIONS.includes(path.extname(file)));

  if (promptFiles.length === 0) {
    return;
  }

  console.log(`\n📦 ${path.relative(ROOT, projectDir)}`);

  for (const file of promptFiles) {
    const fullPath = path.join(promptsDir, file);
    const envKey = path.parse(file).name;
    const prompt = fs.readFileSync(fullPath, "utf8");
    const encoded = Buffer.from(prompt, "utf8").toString("base64");
    updateEnvFile(envPath, envKey, encoded);
    console.log(`  ✓ ${envKey}`);
  }

  console.log(`  → ${path.relative(ROOT, envPath)}`);
};

for (const searchDir of SEARCH_DIRS) {
  const fullSearchDir = path.join(ROOT, searchDir);
  const projects = findDirectories(fullSearchDir);

  for (const projectDir of projects) {
    processProject(projectDir);
  }
}

console.log("\nDone.");
