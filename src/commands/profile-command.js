import { getProfilePatch, hasProfileInitOverrides, saveProfileConfig } from "../core/profile-config.js";
import { describeProfile, initProfileHome, listProfiles } from "../core/pixr-home.js";
import { promptForProfileInit } from "../core/prompt-profile-init.js";

export async function runProfileCommand(options) {
  const action = options.profileAction || "list";

  if (action === "init") {
    const initialized = await initProfileHome(options.profileTarget);
    const currentConfig = initialized.profile.config;
    const nextOptions = shouldPromptInteractively(options)
      ? await promptForProfileInit(options.profileTarget, currentConfig)
      : options;
    const shouldSave = shouldPromptInteractively(options) || hasProfileInitOverrides(nextOptions);

    if (shouldSave) {
      await saveProfileConfig(
        options.profileTarget,
        getProfilePatch(nextOptions, process.cwd(), currentConfig),
        { defaultProfile: Boolean(nextOptions.defaultProfile) },
      );
    }

    return printPayload({
      created: initialized.created,
      profile: await describeProfile(options.profileTarget),
    }, options.json);
  }

  if (action === "show") {
    return printPayload(await describeProfile(options.profileTarget), options.json);
  }

  return printPayload({ profiles: await listProfiles() }, options.json);
}

function printPayload(payload, asJson) {
  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
    return payload;
  }

  if (Array.isArray(payload.profiles)) {
    if (payload.profiles.length === 0) {
      console.log("no profiles found");
      return payload;
    }

    for (const profile of payload.profiles) {
      console.log(`${profile.name}${profile.defaultProfile ? " (default)" : ""}: ${describeSource(profile)}`);
    }
    return payload;
  }

  if (payload.profile) {
    console.log(`profile: ${payload.profile.name}`);
    console.log(`source: ${describeSource(payload.profile)}`);
    console.log(`directory: ${payload.profile.profileDir}`);
    printConfig(payload.profile.config);
    console.log(`instruction: ${formatPath(payload.profile.instructionPath, payload.profile.instructionExists)}`);
    console.log(`style: ${formatPath(payload.profile.stylePath, payload.profile.styleExists)}`);
    console.log(`assets: ${formatPath(payload.profile.assetsPath, payload.profile.assetsExists)}`);
    console.log(`created: ${payload.created.length}`);
    return payload;
  }

  console.log(`profile: ${payload.name}`);
  console.log(`source: ${describeSource(payload)}`);
  console.log(`directory: ${payload.profileDir}`);
  printConfig(payload.config);
  console.log(`instruction: ${formatPath(payload.instructionPath, payload.instructionExists)}`);
  console.log(`style: ${formatPath(payload.stylePath, payload.styleExists)}`);
  console.log(`assets: ${formatPath(payload.assetsPath, payload.assetsExists)}`);
  console.log(`config keys: ${Object.keys(payload.config).length}`);
  return payload;
}

function describeSource(profile) {
  if (profile.configDefined && profile.profileDirExists) {
    return "config + files";
  }
  if (profile.configDefined) {
    return "config";
  }
  if (profile.profileDirExists) {
    return "files";
  }
  return "uninitialized";
}

function formatPath(filePath, exists) {
  return `${filePath} (${exists ? "present" : "missing"})`;
}

function printConfig(config) {
  if (config.model) {
    console.log(`model: ${config.model}`);
  }
  if (config.outputDir) {
    console.log(`output dir: ${config.outputDir}`);
  }
  if (config.format) {
    console.log(`format: ${config.format}`);
  }
  if (config.width) {
    console.log(`width: ${config.width}`);
  }
  if (config.height) {
    console.log(`height: ${config.height}`);
  }
  if (config.prefix) {
    console.log(`prefix: ${config.prefix}`);
  }
  if (config.count) {
    console.log(`count: ${config.count}`);
  }
  if (config.promptFile) {
    console.log(`prompt file: ${config.promptFile}`);
  }
}

function shouldPromptInteractively(options) {
  return !options.noInteractive && !options.json && !hasProfileInitOverrides(options) && process.stdin.isTTY && process.stdout.isTTY;
}
